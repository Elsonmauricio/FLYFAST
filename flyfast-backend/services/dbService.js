const { db, FieldValue, queryWithPagination } = require('../config/firebase');

class DatabaseService {
  // Coleções principais
  collections = {
    users: 'users',
    shipments: 'shipments',
    orders: 'orders',
    products: 'products',
    personalShoppers: 'personalShoppers',
    notifications: 'notifications',
    adminLogs: 'adminLogs',
    categories: 'categories',
    reviews: 'reviews',
    addresses: 'addresses'
  };

  // ============ CRUD GENÉRICO ============
  async create(collection, data, id = null) {
    try {
      const collectionRef = db.collection(collection);
      const docRef = id ? collectionRef.doc(id) : collectionRef.doc();
      
      const docData = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await docRef.set(docData);
      
      return {
        success: true,
        id: docRef.id,
        data: docData,
        ref: docRef
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  async getById(collection, id) {
    try {
      const docRef = db.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return {
          success: false,
          error: 'Documento não encontrado'
        };
      }
      
      return {
        success: true,
        id: doc.id,
        data: doc.data(),
        ref: doc.ref
      };
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  async update(collection, id, data) {
    try {
      const docRef = db.collection(collection).doc(id);
      
      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp()
      };

      await docRef.update(updateData);
      
      return {
        success: true,
        id,
        data: updateData
      };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection, id) {
    try {
      const docRef = db.collection(collection).doc(id);
      await docRef.delete();
      
      return {
        success: true,
        id
      };
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  // ============ QUERIES ESPECÍFICAS ============
  async query(collection, conditions = [], options = {}) {
    try {
      const collectionRef = db.collection(collection);
      return await queryWithPagination(collectionRef, {
        where: conditions,
        ...options
      });
    } catch (error) {
      console.error(`Error querying ${collection}:`, error);
      throw error;
    }
  }

  async getByField(collection, field, value) {
    try {
      const snapshot = await db.collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return {
          success: false,
          error: 'Nenhum documento encontrado'
        };
      }
      
      const doc = snapshot.docs[0];
      return {
        success: true,
        id: doc.id,
        data: doc.data(),
        ref: doc.ref
      };
    } catch (error) {
      console.error(`Error getting by field from ${collection}:`, error);
      throw error;
    }
  }

  async batchCreate(collection, items) {
    try {
      const batch = db.batch();
      const results = [];
      
      items.forEach(item => {
        const docRef = db.collection(collection).doc();
        const docData = {
          ...item,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        
        batch.set(docRef, docData);
        results.push({ id: docRef.id, data: docData });
      });
      
      await batch.commit();
      
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error(`Error batch creating in ${collection}:`, error);
      throw error;
    }
  }

  // ============ OPERAÇÕES DE USUÁRIO ============
  async getUserByEmail(email) {
    return this.getByField(this.collections.users, 'email', email);
  }

  async getUserByUid(uid) {
    return this.getByField(this.collections.users, 'uid', uid);
  }

  async createUser(userData) {
    // Primeiro criar no Firebase Auth
    const { auth } = require('../config/firebase');
    const firebaseUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      phoneNumber: userData.phone
    });

    // Depois criar no Firestore
    const userDoc = {
      uid: firebaseUser.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: 'user',
      isActive: true,
      emailVerified: false,
      preferences: {
        notifications: {
          email: true,
          sms: true,
          whatsapp: true,
          push: true
        },
        language: 'pt',
        currency: 'AOA'
      },
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    return this.create(this.collections.users, userDoc, firebaseUser.uid);
  }

  async updateUserProfile(uid, updates) {
    const allowedUpdates = ['name', 'phone', 'preferences', 'addresses'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    return this.update(this.collections.users, uid, filteredUpdates);
  }

  // ============ OPERAÇÕES DE ENVIO ============
  async createShipment(shipmentData) {
    // Gerar tracking code
    const trackingCode = this.generateTrackingCode(
      shipmentData.route.from,
      shipmentData.route.to
    );

    const shipmentDoc = {
      ...shipmentData,
      trackingCode,
      status: 'pending',
      currentLocation: 'Aguardando recolha',
      trackingHistory: [{
        status: 'pending',
        location: 'Aguardando recolha',
        description: 'Envio criado',
        timestamp: FieldValue.serverTimestamp(),
        isMilestone: true
      }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    return this.create(this.collections.shipments, shipmentDoc);
  }

  async getShipmentByTrackingCode(trackingCode) {
    return this.getByField(this.collections.shipments, 'trackingCode', trackingCode);
  }

  async getUserShipments(userId, options = {}) {
    return this.query(this.collections.shipments, [
      ['userId', '==', userId]
    ], options);
  }

  async updateShipmentStatus(trackingCode, status, updateData = {}) {
    const shipment = await this.getShipmentByTrackingCode(trackingCode);
    
    if (!shipment.success) {
      throw new Error('Envio não encontrado');
    }

    const updateDoc = {
      status,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (updateData.location) {
      updateDoc.currentLocation = updateData.location;
    }

    // Adicionar ao histórico
    const historyItem = {
      status,
      location: updateData.location || shipment.data.currentLocation,
      description: updateData.description || `Status atualizado para: ${status}`,
      timestamp: FieldValue.serverTimestamp(),
      isMilestone: updateData.isMilestone || false
    };

    updateDoc.trackingHistory = FieldValue.arrayUnion(historyItem);

    return this.update(this.collections.shipments, shipment.id, updateDoc);
  }

  // ============ OPERAÇÕES DE PRODUTO ============
  async createProduct(productData) {
    // Gerar SKU
    const sku = this.generateSKU(productData.category);
    
    const productDoc = {
      ...productData,
      sku,
      status: productData.status || 'active',
      inventory: {
        stock: productData.inventory?.stock || 0,
        lowStockThreshold: productData.inventory?.lowStockThreshold || 10,
        manageStock: productData.inventory?.manageStock ?? true,
        allowBackorder: productData.inventory?.allowBackorder ?? false
      },
      ratings: {
        average: 0,
        count: 0,
        reviews: []
      },
      stats: {
        views: 0,
        purchases: 0,
        wishlists: 0
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    return this.create(this.collections.products, productDoc);
  }

  async getProductsByCategory(category, options = {}) {
    return this.query(this.collections.products, [
      ['category', '==', category],
      ['status', '==', 'active']
    ], options);
  }

  async reduceProductStock(productId, quantity) {
    const product = await this.getById(this.collections.products, productId);
    
    if (!product.success) {
      throw new Error('Produto não encontrado');
    }

    if (product.data.inventory.manageStock) {
      const newStock = product.data.inventory.stock - quantity;
      
      if (newStock < 0 && !product.data.inventory.allowBackorder) {
        throw new Error('Stock insuficiente');
      }

      const updates = {
        'inventory.stock': newStock
      };

      if (newStock <= 0) {
        updates.status = 'out_of_stock';
      }

      return this.update(this.collections.products, productId, updates);
    }

    return { success: true };
  }

  // ============ HELPERS ============
  generateTrackingCode(from, to) {
    const date = new Date();
    const fromCode = from === 'Luanda' ? 'LDA' : 'LIS';
    const toCode = to === 'Lisboa' ? 'LIS' : 'LDA';
    const year = date.getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    
    return `${fromCode}-${toCode}-${year}-${random}`;
  }

  generateSKU(category) {
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  }

  // ============ ESTATÍSTICAS ============
  async getStats(collection, field, operator, value) {
    try {
      const snapshot = await db.collection(collection)
        .where(field, operator, value)
        .get();
      
      return {
        success: true,
        count: snapshot.size,
        data: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error(`Error getting stats from ${collection}:`, error);
      throw error;
    }
  }

  async getDashboardStats() {
    const [
      usersCount,
      shipmentsCount,
      ordersCount,
      productsCount
    ] = await Promise.all([
      this.getStats(this.collections.users, 'isActive', '==', true),
      this.getStats(this.collections.shipments, 'status', '!=', 'cancelled'),
      this.getStats(this.collections.orders, 'status', '!=', 'cancelled'),
      this.getStats(this.collections.products, 'status', '==', 'active')
    ]);

    return {
      users: usersCount.count,
      shipments: shipmentsCount.count,
      orders: ordersCount.count,
      products: productsCount.count
    };
  }
}

module.exports = new DatabaseService();