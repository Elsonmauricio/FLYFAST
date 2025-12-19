const { db } = require('../config/firebase');

const adminLogsCollection = db.collection('adminLogs');

class AdminLog {
  constructor({
    id,
    userId,
    action,
    entity,
    entityId = null,
    description,
    details = {},
    changes = {},
    ipAddress = null,
    userAgent = null,
    createdAt = new Date()
  }) {
    this.id = id; // Firestore document ID
    this.userId = userId; // Firebase User UID (string)
    this.action = action;
    this.entity = entity;
    this.entityId = entityId; // string
    this.description = description;
    this.details = details;
    this.changes = changes;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.createdAt = createdAt;
  }

  // Salva o log no Firestore
  async save() {
    const logData = { ...this };
    delete logData.id; // Não salvar o ID do documento como um campo

    if (this.id) {
      // Atualizar um log existente
      await adminLogsCollection.doc(this.id).set(logData, { merge: true });
    } else {
      // Criar um novo log
      const docRef = await adminLogsCollection.add(logData);
      this.id = docRef.id;
    }
    return this;
  }

  /**
   * Método estático para criar e salvar um log rapidamente.
   * @param {object} data - Os dados para o log.
   * @returns {Promise<AdminLog>}
   */
  static async log(data) {
    try {
      const logEntry = new AdminLog(data);
      await logEntry.save();
      return logEntry;
    } catch (error) {
      console.error('Error saving admin log:', error);
      // Opcional: Lançar o erro para que o chamador possa lidar com ele
      throw error;
    }
  }

  /**
   * Encontra um log pelo seu ID.
   * @param {string} id - O ID do documento no Firestore.
   * @returns {Promise<AdminLog|null>}
   */
  static async findById(id) {
    const doc = await adminLogsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return new AdminLog({ id: doc.id, ...doc.data() });
  }
}

module.exports = AdminLog;