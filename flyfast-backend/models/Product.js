const { db } = require('../config/firebase');

const productsCollection = db.collection('products');

class Product {
  constructor(data) {
    this.id = data.id;
    this.sku = data.sku;
    this.name = data.name;
    this.description = data.description;
    this.shortDescription = data.shortDescription || '';
    this.category = data.category;
    this.subcategory = data.subcategory || '';
    this.tags = data.tags || [];
    this.images = data.images || [];
    this.variants = data.variants || [];
    this.price = data.price || { amount: 0, currency: 'AOA' };
    this.inventory = data.inventory || { stock: 0, manageStock: true, allowBackorder: false };
    this.shipping = data.shipping || { requiresShipping: true };
    this.seo = data.seo || {};
    this.ratings = data.ratings || { average: 0, count: 0, reviews: [] };
    this.stats = data.stats || { views: 0, purchases: 0, wishlists: 0 };
    this.status = data.status || 'active';
    this.brand = data.brand || '';
    this.manufacturer = data.manufacturer || '';
    this.features = data.features || [];
    this.specifications = data.specifications || {};
    this.publishedAt = data.publishedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  _generateSku() {
    if (!this.sku && this.name && this.category) {
      const prefix = this.category.substring(0, 3).toUpperCase();
      const random = Math.floor(1000 + Math.random() * 9000);
      this.sku = `${prefix}-${random}`;
    }
  }

  _generateSlug() {
    if (!this.seo.slug && this.name) {
      this.seo.slug = this.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-word chars
        .replace(/[\s_-]+/g, '-') // swap spaces for -
        .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
    }
  }

  async save() {
    this.updatedAt = new Date();
    this._generateSku();
    this._generateSlug();

    const productData = { ...this };
    delete productData.id;

    if (this.id) {
      await productsCollection.doc(this.id).set(productData, { merge: true });
    } else {
      const docRef = await productsCollection.add(productData);
      this.id = docRef.id;
    }
    return this;
  }

  static async findById(id) {
    const doc = await productsCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Product({ id: doc.id, ...doc.data() });
  }

  static async create(data) {
    const product = new Product(data);
    await product.save();
    return product;
  }

  get isLowStock() {
    return this.inventory.stock <= (this.inventory.lowStockThreshold || 10);
  }

  get isAvailable() {
    return this.status === 'active' && (this.inventory.stock > 0 || this.inventory.allowBackorder);
  }

  updateRating() {
    if (!this.ratings.reviews || this.ratings.reviews.length === 0) {
      this.ratings.average = 0;
      this.ratings.count = 0;
      return;
    }
    const total = this.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = total / this.ratings.reviews.length;
    this.ratings.count = this.ratings.reviews.length;
  }

  async addReview({ userId, rating, comment, verifiedPurchase = false }) {
    this.ratings.reviews.push({
      userId, // Firebase UID
      rating,
      comment,
      verifiedPurchase,
      createdAt: new Date()
    });
    this.updateRating();
    return this.save();
  }

  async reduceStock(quantity) {
    if (this.inventory.manageStock) {
      if (this.inventory.stock < quantity && !this.inventory.allowBackorder) {
        throw new Error('Stock insuficiente');
      }
      this.inventory.stock -= quantity;
      if (this.inventory.stock <= 0 && !this.inventory.allowBackorder) {
        this.status = 'out_of_stock';
      }
      return this.save();
    }
    return this; // Se não gerir stock, não faz nada
  }
}

module.exports = Product;