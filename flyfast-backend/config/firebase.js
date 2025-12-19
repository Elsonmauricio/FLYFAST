const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Inicializar Firebase apenas uma vez
if (!admin.apps.length) {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Para produção: carregar de uma variável de ambiente (codificada em base64)
    const serviceAccountBase64 = process.env;
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('ascii');
    serviceAccount = JSON.parse(serviceAccountJson);
  } else {
    // Para desenvolvimento: carregar do arquivo local
    try {
      serviceAccount = require('../flyfast-48af2-firebase-adminsdk-fbsvc-f94e7e1676.json');
    } catch (error) {
      console.error("Erro: O arquivo 'flyfast-48af2-firebase-adminsdk-fbsvc-f94e7e1676.json' não foi encontrado na raiz do projeto. Faça o download no console do Firebase.");
      process.exit(1); // Interrompe a execução se o arquivo for crucial
    }
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

// Exportar serviços
const db = getFirestore();
const auth = admin.auth();
const storage = getStorage().bucket();
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