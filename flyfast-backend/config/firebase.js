const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Inicializar Firebase apenas uma vez
if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Para produção: carregar de uma variável de ambiente (codificada em base64)
      // Removemos espaços em branco que possam ter sido copiados acidentalmente
      const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\s/g, '');
      const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('ascii');
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log("✅ Credenciais carregadas via Variável de Ambiente.");
    } else {
      // Para desenvolvimento: carregar do arquivo local
      try {
        serviceAccount = require('../service-account.json');
        console.log("✅ Credenciais carregadas via ficheiro local.");
      } catch (error) {
        console.error("⚠️ ERRO: service-account.json não encontrado localmente.");
      }
    }

    if (!serviceAccount) {
      throw new Error("Nenhuma credencial encontrada (Env Var ou Ficheiro Local).");
    }
  } catch (error) {
    console.error("❌ FALHA AO CARREGAR CREDENCIAIS:", error.message);
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'flyfast-48af2.appspot.com',
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
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
  db = { collection: () => ({ doc: () => ({ get: () => Promise.reject("Firebase não inicializado") }) }) };
  auth = { verifyIdToken: () => Promise.reject("Firebase não inicializado") };
  storage = {};
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