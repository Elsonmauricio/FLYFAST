const { db, auth } = require('../config/firebase'); // Assumindo que você tem um arquivo de configuração do Firebase

const usersCollection = db.collection('users');

class User {
  constructor({
    uid,
    name,
    email,
    phone,
    addresses = [],
    preferences = {},
    loyaltyPoints = 0,
    loyaltyTier = 'bronze',
    stripeCustomerId = null,
    referrals = [],
    role = 'user',
    isActive = true,
    emailVerified = false,
    phoneVerified = false,
    lastLogin = null,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.uid = uid; // Firebase User ID
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.addresses = addresses;
    this.preferences = {
      notifications: { email: true, sms: true, whatsapp: true, push: true, ...preferences.notifications },
      language: preferences.language || 'pt',
      currency: preferences.currency || 'AOA'
    };
    this.loyaltyPoints = loyaltyPoints;
    this.loyaltyTier = loyaltyTier;
    this.stripeCustomerId = stripeCustomerId;
    this.referrals = referrals;
    this.role = role;
    this.isActive = isActive;
    this.emailVerified = emailVerified;
    this.phoneVerified = phoneVerified;
    this.lastLogin = lastLogin;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Salva ou atualiza o utilizador no Firestore
  async save() {
    if (!this.uid) {
      throw new Error('User UID is required to save to Firestore.');
    }
    this.updatedAt = new Date();
    const userData = { ...this };
    // Remove uid do objeto para não ser salvo como um campo separado se já for o ID do documento
    delete userData.uid; 
    await usersCollection.doc(this.uid).set(userData, { merge: true });
    return this;
  }

  // Métodos estáticos para interagir com a coleção de utilizadores
  static async create(userData) {
    // Para criar um utilizador com Firebase Authentication, você usaria auth.createUser
    // e depois salvaria os dados adicionais no Firestore.
    // Este método aqui assume que o `uid` já foi gerado pelo Firebase Auth.
    if (!userData.uid) {
      throw new Error('Firebase UID is required to create a user in Firestore.');
    }
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  }

  static async findById(uid) {
    const doc = await usersCollection.doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return new User({ uid: doc.id, ...doc.data() });
  }

  static async findByEmail(email) {
    const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return new User({ uid: doc.id, ...doc.data() });
  }

  // Atualizar pontos de fidelidade
  async addLoyaltyPoints(points) {
    this.loyaltyPoints += points;

    // Atualizar tier baseado em pontos
    if (this.loyaltyPoints >= 10000) this.loyaltyTier = 'platinum';
    else if (this.loyaltyPoints >= 5000) this.loyaltyTier = 'gold';
    else if (this.loyaltyPoints >= 1000) this.loyaltyTier = 'silver';

    await this.save();
    return this.loyaltyTier;
  }

  // Métodos de autenticação (geralmente tratados pelo Firebase Auth SDK no frontend/middleware)
  // Se precisar de verificar passwords no backend, usaria o Firebase Admin SDK para verificar tokens de ID
  // ou para criar/gerir utilizadores diretamente.
  // A comparação de password e geração de token JWT seriam substituídas pela lógica do Firebase Auth.

  // Exemplo de como obter o token de ID do Firebase (geralmente feito no cliente)
  // Se precisar de gerar tokens personalizados no backend, usaria auth.createCustomToken(uid)
  async getFirebaseIdToken() {
    // Este método é mais comum no lado do cliente após o login.
    // No backend, você geralmente verifica tokens de ID recebidos do cliente.
    // Se precisar de um token para interagir com outros serviços Firebase como o utilizador,
    // pode ser necessário um token personalizado ou usar as credenciais do Admin SDK.
    console.warn('getFirebaseIdToken é tipicamente um método do cliente. No backend, você geralmente verifica tokens de ID ou usa o Admin SDK.');
    return null; // Ou implementar a lógica de token personalizado se necessário
  }
}

module.exports = User;