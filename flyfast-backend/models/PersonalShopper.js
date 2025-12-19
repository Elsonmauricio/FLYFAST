const { db } = require('../config/firebase');

const personalShopperCollection = db.collection('personalShopperRequests');

class PersonalShopperRequest {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId; // Firebase UID
    this.clientInfo = data.clientInfo || {};
    this.requestNumber = data.requestNumber;
    this.product = data.product || {};
    this.budget = data.budget || { currency: 'AOA' };
    this.status = data.status || 'pending';
    this.assignedTo = data.assignedTo || null; // Staff member UID
    this.priority = data.priority || 'normal';
    this.searchResults = data.searchResults || [];
    this.selectedOption = data.selectedOption || {};
    this.costs = data.costs || {};
    this.payment = data.payment || { status: 'pending' };
    this.shipping = data.shipping || {};
    this.messages = data.messages || [];
    this.clientNotes = data.clientNotes || '';
    this.staffNotes = data.staffNotes || '';
    this.rating = data.rating || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.completedAt = data.completedAt || null;
  }

  _generateRequestNumber() {
    if (!this.requestNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(100 + Math.random() * 900);
      this.requestNumber = `PS-${year}${month}-${random}`;
    }
  }

  _calculateCosts() {
    const productCost = this.selectedOption?.price || 0;
    if (productCost > 0) {
      this.costs.productCost = productCost;
      // A taxa de serviço pode ser baseada no custo do produto ou no orçamento
      const baseAmount = this.selectedOption.price || this.budget.amount;
      this.costs.serviceFee = baseAmount * 0.15; // 15% fee
      this.costs.total = (this.costs.productCost || 0) +
                         (this.costs.serviceFee || 0) +
                         (this.costs.shippingCost || 0) +
                         (this.costs.tax || 0);
    } else if (!this.costs.serviceFee && this.budget.amount) {
        // Se o produto ainda não foi comprado, calcula a taxa com base no orçamento
        this.costs.serviceFee = this.budget.amount * 0.15;
    }
  }

  async save() {
    this.updatedAt = new Date();
    this._generateRequestNumber();
    this._calculateCosts();

    const requestData = { ...this };
    delete requestData.id;

    if (this.id) {
      await personalShopperCollection.doc(this.id).set(requestData, { merge: true });
    } else {
      const docRef = await personalShopperCollection.add(requestData);
      this.id = docRef.id;
    }
    return this;
  }

  static async findById(id) {
    const doc = await personalShopperCollection.doc(id).get();
    if (!doc.exists) return null;
    return new PersonalShopperRequest({ id: doc.id, ...doc.data() });
  }
s
  static async create(data) {
    const request = new PersonalShopperRequest(data);
    await request.save();
    return request;
  }

  // Adicionar mensagem
  async addMessage(from, message, attachments = []) {
    this.messages.push({
      from, // 'client' ou 'staff'
      message,
      attachments,
      timestamp: new Date(),
      read: false
    });
    return this.save();
  }

  // Atualizar status
  async updateStatus(newStatus) {
    this.status = newStatus;
    if (newStatus === 'completed' || newStatus === 'delivered') {
      this.completedAt = new Date();
    }
    return this.save();
  }
}

module.exports = PersonalShopperRequest;