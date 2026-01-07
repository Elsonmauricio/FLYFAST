require('dotenv').config(); // Garante que as variáveis .env sejam lidas aqui
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Inicializar Firebase apenas uma vez
if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    // 1. TENTATIVA LOCAL: Prioriza o arquivo service-account.json se existir
    try {
      serviceAccount = require('../flyfast-service-account.json');
      console.log("✅ Credenciais carregadas via ARQUIVO LOCAL (flyfast-service-account.json).");
    } catch (ignored) {
      if (process.env.NODE_ENV === 'development') {
        console.log("ℹ️  Arquivo local 'flyfast-service-account.json' não encontrado. Tentando variáveis de ambiente...");
      }
    }

    // 2. TENTATIVA AMBIENTE: Se não carregou do arquivo, tenta variáveis
    if (!serviceAccount) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Opção Base64
            const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\s/g, '');
            const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('ascii');
            serviceAccount = JSON.parse(serviceAccountJson);
            console.log("✅ Credenciais carregadas via Variável de Ambiente (Base64).");
        } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            // Opção Variáveis Individuais (Vercel)
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;
            
            // Limpeza robusta da chave
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.slice(1, -1); // Remove aspas externas
            }
            privateKey = privateKey.replace(/\\n/g, '\n'); // Corrige quebras de linha

            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            };
            
            if (!serviceAccount.projectId) throw new Error("FIREBASE_PROJECT_ID faltando.");
            
            console.log(`✅ Credenciais carregadas via Variáveis Individuais.`);
            console.log(`   - Project ID: ${serviceAccount.projectId}`);
        }
    }

    if (!serviceAccount) {
      // Log detalhado para ajudar no debug
      console.error("❌ ERRO DE CONFIGURAÇÃO: Nenhuma credencial encontrada.");
      console.error("   - Arquivo local: flyfast-service-account.json (Não encontrado)");
      console.error("   - Env Var FIREBASE_SERVICE_ACCOUNT: " + (process.env.FIREBASE_SERVICE_ACCOUNT ? "Definida" : "Indefinida"));
      console.error("   - Env Var FIREBASE_PRIVATE_KEY: " + (process.env.FIREBASE_PRIVATE_KEY ? "Definida" : "Indefinida"));
      throw new Error("Nenhuma credencial encontrada (Env Var ou Ficheiro Local).");
    }
  } catch (error) {
    console.error("❌ FALHA AO CARREGAR CREDENCIAIS:", error.message);
  }

  if (serviceAccount) {
    const projectId = serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      databaseURL: `https://${projectId}.firebaseio.com`
    });
  }
}

// Exportar serviços
let db, auth, storage;

try {
  db = getFirestore();
  auth = admin.auth();
  storage = getStorage().bucket();
} catch (error) {
  console.error("❌ ERRO AO INICIALIZAR SERVIÇOS FIREBASE:", error.message);
  // Mock para evitar crash imediato na importação, permitindo ver os logs
  const mockReject = () => Promise.reject(new Error("Firebase não inicializado. Verifique logs do servidor."));
  const mockQuery = { 
    get: mockReject, 
    where: () => mockQuery, 
    orderBy: () => mockQuery, 
    limit: () => mockQuery, 
    startAfter: () => mockQuery 
  };
  db = { 
    collection: () => ({ 
      ...mockQuery,
      doc: () => ({ get: mockReject, set: mockReject, update: mockReject, delete: mockReject }),
      add: mockReject
    }),
    runTransaction: mockReject
  };
  auth = { verifyIdToken: mockReject };
  storage = { file: () => ({ save: mockReject }) };
}

const FieldValue = admin.firestore.FieldValue;

// Helper functions
const verifyIdToken = async (token) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified || false
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Token inválido ou expirado');
  }
};

// Batch operations helper
const runTransaction = async (callback) => {
  return await db.runTransaction(callback);
};

// Query helpers
const queryWithPagination = async (collectionRef, options = {}) => {
  const {
    where = [],
    orderBy = { field: 'createdAt', direction: 'desc' },
    limit = 20,
    page = 1,
    startAfter = null
  } = options;

  let query = collectionRef;

  // Apply where clauses
  where.forEach(([field, operator, value]) => {
    query = query.where(field, operator, value);
  });

  // Apply ordering
  query = query.orderBy(orderBy.field, orderBy.direction);

  // Apply pagination
  const offset = (page - 1) * limit;
  
  if (startAfter) {
    query = query.startAfter(startAfter);
  }
  
  query = query.limit(limit);

  const snapshot = await query.get();
  const data = [];
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data(),
      _ref: doc.ref
    });
  });

  // Get total count
  let totalCount = 0;
  if (page === 1) {
    let countQuery = collectionRef;
    where.forEach(([field, operator, value]) => {
      countQuery = countQuery.where(field, operator, value);
    });
    const countSnapshot = await countQuery.get();
    totalCount = countSnapshot.size;
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasNext: data.length === limit,
      lastDoc: data.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    }
  };
};

module.exports = {
  admin,
  db,
  auth,
  storage,
  FieldValue,
  verifyIdToken,
  runTransaction,
  queryWithPagination
};