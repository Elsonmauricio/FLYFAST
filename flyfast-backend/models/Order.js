const { db } = require('../config/firebase');

const ordersCollection = db.collection('orders');

class Order {
  constructor(data) {
    this.id = data.id;
    this.orderNumber = data.orderNumber;
    this.userId = data.userId; // Firebase UID
    this.guestEmail = data.guestEmail || null;
    this.guestPhone = data.guestPhone || null;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.shippingCost = data.shippingCost || 0;
    this.tax = data.tax || 0;
    this.discount = data.discount || {};
    this.totalAmount = data.totalAmount || 0;
    this.currency = data.currency || 'AOA';
    this.shipping = data.shipping || { method: 'standard' };
    this.billing = data.billing || {};
    this.payment = data.payment || { status: 'pending' };
    this.status = data.status || 'pending';
    this.statusHistory = data.statusHistory || [];
    this.customerNotes = data.customerNotes || '';
    this.adminNotes = data.adminNotes || '';
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.completedAt = data.completedAt || null;
  }

  _generateOrderNumber() {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      this.orderNumber = `FLYFAST-${year}${month}${day}-${random}`;
    }
  }

  _calculateTotals() {
    if (this.items && this.items.length > 0) {
      this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      this.totalAmount = this.subtotal + this.shippingCost + this.tax - (this.discount?.amount || 0);
    }
  }

  async save() {
    this.updatedAt = new Date();
    this._generateOrderNumber();
    this._calculateTotals();

    const orderData = { ...this };
    delete orderData.id;

    if (this.id) {
      await ordersCollection.doc(this.id).set(orderData, { merge: true });
    } else {
      const docRef = await ordersCollection.add(orderData);
      this.id = docRef.id;
    }
    return this;
  }

  static async findById(id) {
    const doc = await ordersCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Order({ id: doc.id, ...doc.data() });
  }

  static async findByOrderNumber(orderNumber) {
    const snapshot = await ordersCollection.where('orderNumber', '==', orderNumber).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return new Order({ id: doc.id, ...doc.data() });
  }

  static async create(data) {
    const order = new Order(data);
    // Adiciona o primeiro status ao histórico
    order.statusHistory.push({
        status: order.status,
        changedBy: 'system',
        notes: 'Pedido criado.',
        timestamp: new Date()
    });
    await order.save();
    return order;
  }

  // Atualizar histórico de status
  async updateStatus(newStatus, changedBy = 'system', notes = '') {
    this.statusHistory.push({
      status: newStatus,
      changedBy,
      notes,
      timestamp: new Date()
    });

    this.status = newStatus;

    if (newStatus === 'delivered') {
      this.completedAt = new Date();
    }

    return this.save();
  }

  // Getter para substituir o virtual 'totalItems'
  get totalItems() {
    if (!this.items) return 0;
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

module.exports = Order;