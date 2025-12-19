const { db } = require('../config/firebase');

const shipmentsCollection = db.collection('shipments');

class Shipment {
  constructor(data) {
    this.id = data.id;
    this.trackingCode = data.trackingCode;
    this.userId = data.userId; // Firebase UID
    this.sender = data.sender || {};
    this.recipient = data.recipient || {};
    this.route = data.route || {};
    this.package = data.package || {};
    this.status = data.status || 'pending';
    this.currentLocation = data.currentLocation || {};
    this.trackingHistory = data.trackingHistory || [];
    this.estimatedDelivery = data.estimatedDelivery || null;
    this.actualDelivery = data.actualDelivery || null;
    this.deliveryProof = data.deliveryProof || {};
    this.payment = data.payment || { status: 'pending' };
    this.insurance = data.insurance || { isInsured: false };
    this.notifications = data.notifications || {};
    this.createdBy = data.createdBy; // Firebase UID
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  _generateTrackingCode() {
    if (!this.trackingCode && this.route.from && this.route.to) {
      const date = new Date();
      const prefix = this.route.from.substring(0, 3).toUpperCase();
      const suffix = this.route.to.substring(0, 3).toUpperCase();
      const random = Math.floor(1000 + Math.random() * 9000);
      const year = date.getFullYear();
      this.trackingCode = `${prefix}-${suffix}-${year}-${random}`;
    }
  }

  async save() {
    this.updatedAt = new Date();
    this._generateTrackingCode();

    const shipmentData = { ...this };
    delete shipmentData.id;

    if (this.id) {
      await shipmentsCollection.doc(this.id).set(shipmentData, { merge: true });
    } else {
      // Para garantir um trackingCode único, podemos verificar antes de adicionar.
      // No entanto, a geração com timestamp e random torna colisões muito raras.
      // Uma abordagem mais robusta usaria uma transação ou um contador centralizado.
      const docRef = await shipmentsCollection.add(shipmentData);
      this.id = docRef.id;
    }
    return this;
  }

  static async findById(id) {
    const doc = await shipmentsCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Shipment({ id: doc.id, ...doc.data() });
  }

  static async findByTrackingCode(trackingCode) {
    const snapshot = await shipmentsCollection.where('trackingCode', '==', trackingCode).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return new Shipment({ id: doc.id, ...doc.data() });
  }

  static async findForUser({ userId, page = 1, limit = 10 }) {
    const userShipmentsQuery = shipmentsCollection.where('userId', '==', userId);

    const totalSnapshot = await userShipmentsQuery.count().get();
    const total = totalSnapshot.data().count;

    const shipmentsSnapshot = await userShipmentsQuery
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const shipments = shipmentsSnapshot.docs.map(doc => new Shipment({ id: doc.id, ...doc.data() }));

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async create(data) {
    const shipment = new Shipment(data);
    await shipment.save();
    return shipment;
  }

  // Adicionar evento ao histórico
  async addTrackingEvent(status, location, description, isMilestone = false) {
    this.trackingHistory.push({
      status,
      location,
      description,
      isMilestone,
      timestamp: new Date()
    });

    this.status = status;
    if (typeof location === 'string') {
        this.currentLocation = { name: location, timestamp: new Date() };
    } else {
        this.currentLocation = { ...location, timestamp: new Date() };
    }

    return this.save();
  }

  // Getter para substituir o virtual 'daysInTransit'
  get daysInTransit() {
    if (!this.createdAt) return 0;
    const now = new Date();
    // Assegurar que createdAt é um objeto Date
    const createdAtDate = this.createdAt.toDate ? this.createdAt.toDate() : new Date(this.createdAt);
    const diffTime = Math.abs(now - createdAtDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Getter para substituir o virtual 'isDelayed'
  get isDelayed() {
    if (!this.estimatedDelivery) return false;
    const now = new Date();
    const estimatedDate = this.estimatedDelivery.toDate ? this.estimatedDelivery.toDate() : new Date(this.estimatedDelivery);
    return now > estimatedDate && this.status !== 'delivered';
  }
}

module.exports = Shipment;