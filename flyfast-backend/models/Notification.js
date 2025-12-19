const { db } = require('../config/firebase');

const notificationsCollection = db.collection('notifications');

class Notification {
  constructor({
    id,
    userId,
    type,
    title,
    message,
    data = {},
    channels = {},
    status = 'pending',
    priority = 'normal',
    expiresAt = null,
    retryCount = 0,
    sentAt = null,
    deliveredAt = null,
    readAt = null,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.userId = userId; // Firebase User UID
    this.type = type;
    this.title = title;
    this.message = message;
    this.data = data;
    this.channels = {
      email: { sent: false, ...channels.email },
      whatsapp: { sent: false, ...channels.whatsapp },
      sms: { sent: false, ...channels.sms },
      push: { sent: false, ...channels.push },
    };
    this.status = status;
    this.priority = priority;
    this.expiresAt = expiresAt;
    this.retryCount = retryCount;
    this.sentAt = sentAt;
    this.deliveredAt = deliveredAt;
    this.readAt = readAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  async save() {
    this.updatedAt = new Date();
    const notificationData = { ...this };
    delete notificationData.id;

    if (this.id) {
      await notificationsCollection.doc(this.id).set(notificationData, { merge: true });
    } else {
      const docRef = await notificationsCollection.add(notificationData);
      this.id = docRef.id;
    }
    return this;
  }

  static async findById(id) {
    const doc = await notificationsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return new Notification({ id: doc.id, ...doc.data() });
  }

  static async create(data) {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  }

  static async findForUser({ userId, page = 1, limit = 20 }) {
    const userNotificationsQuery = notificationsCollection.where('userId', '==', userId);

    // Para contar o total e as não lidas
    const totalSnapshot = await userNotificationsQuery.count().get();
    const unreadSnapshot = await userNotificationsQuery.where('status', '!=', 'read').count().get();
    
    const total = totalSnapshot.data().count;
    const unreadCount = unreadSnapshot.data().count;

    // Para paginar os resultados
    const notificationsSnapshot = await userNotificationsQuery
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const notifications = notificationsSnapshot.docs.map(doc => new Notification({ id: doc.id, ...doc.data() }));

    return {
      notifications,
      total,
      unreadCount
    };
  }

  // Marcar como lida
  async markAsRead() {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }

  // Marcar como entregue
  async markAsDelivered(channel) {
    if (channel && this.channels[channel]) {
      this.channels[channel].sent = true;
      this.channels[channel].sentAt = new Date();
    }

    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
  }

  // Verificar se expirou
  isExpired() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Tentar reenviar
  async retry() {
    this.retryCount += 1;
    this.status = 'pending';
    return this.save();
  }
}

module.exports = Notification;