const Product = require('../models/Product');
const { db, auth } = require('../config/firebase');
const { sendTrackingEmail } = require('../services/emailService');

class AdminController {
  // Dashboard
  async getDashboardStats(req, res) {
    try {
      // Nota: Em produção com muitos dados, usar count() ou contadores distribuídos é melhor
      const usersSnapshot = await db.collection('users').get();
      const shipmentsSnapshot = await db.collection('shipments').get();
      const ordersSnapshot = await db.collection('orders').get();

      res.json({
        totalUsers: usersSnapshot.size,
        activeShipments: shipmentsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        monthlyRevenue: 1500000 // Exemplo estático ou calcular soma de orders
      });
    } catch (error) {
      console.error('Erro stats:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  // Usuários
  async getUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const startAfter = req.query.startAfter;

      let query = db.collection('users').orderBy('email'); // Ordenação necessária para paginação

      if (startAfter) {
        const doc = await db.collection('users').doc(startAfter).get();
        if (doc.exists) {
          query = query.startAfter(doc);
        }
      }

      const snapshot = await query.limit(limit).get();
      const users = [];
      snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
      
      // Retorna os utilizadores e o ID do último para servir de cursor
      res.json({ 
        users, 
        lastVisible: users.length > 0 ? users[users.length - 1].id : null 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar utilizadores' });
    }
  }

  async getUserDetails(req, res) {
    try {
      const doc = await db.collection('users').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Utilizador não encontrado' });
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar detalhes' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (role && !['admin', 'customer'].includes(role)) {
        return res.status(400).json({ error: 'Role inválida. Use "admin" ou "customer".' });
      }

      // Se o role estiver a ser atualizado, temos que atualizar também os custom claims
      // para que a verificação no frontend e backend funcione corretamente.
      if (role) {
        await auth.setCustomUserClaims(id, { role });
      }

      await db.collection('users').doc(id).update(req.body);
      res.json({ message: 'Utilizador atualizado com sucesso' });
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      res.status(500).json({ error: 'Erro ao atualizar utilizador' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      // Apagar do Authentication
      await auth.deleteUser(id);
      // Apagar do Firestore
      await db.collection('users').doc(id).delete();
      res.json({ message: 'Utilizador removido com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao remover utilizador' });
    }
  }

  async impersonateUser(req, res) { res.status(501).json({ message: 'Not Implemented: impersonateUser' }); }

  // Envios
  async getShipments(req, res) {
    try {
      const snapshot = await db.collection('shipments').orderBy('createdAt', 'desc').limit(50).get();
      const shipments = [];
      snapshot.forEach(doc => shipments.push({ id: doc.id, ...doc.data() }));
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar envios' });
    }
  }

  async createShipment(req, res) {
    try {
      const newShipment = {
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await db.collection('shipments').add(newShipment);

      // Enviar email automático se houver userId
      if (newShipment.userId) {
        try {
          const userRecord = await auth.getUser(newShipment.userId);
          if (userRecord.email) {
            // Envia o email em segundo plano (não bloqueia a resposta)
            sendTrackingEmail(userRecord.email, docRef.id, newShipment).catch(console.error);
          }
        } catch (err) {
          console.error("Erro ao processar email de rastreio:", err.message);
        }
      }

      res.status(201).json({ id: docRef.id, ...newShipment });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar envio' });
    }
  }

  async getShipmentDetails(req, res) {
    try {
      const doc = await db.collection('shipments').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Envio não encontrado' });
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar detalhes do envio' });
    }
  }

  async updateShipment(req, res) {
    try {
      await db.collection('shipments').doc(req.params.id).update(req.body);
      res.json({ message: 'Envio atualizado' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar envio' });
    }
  }

  async deleteShipment(req, res) {
    try {
      await db.collection('shipments').doc(req.params.id).delete();
      res.json({ message: 'Envio removido' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover envio' });
    }
  }

  async resendShipmentEmail(req, res) {
    try {
      const { id } = req.params;
      const doc = await db.collection('shipments').doc(id).get();
      
      if (!doc.exists) return res.status(404).json({ error: 'Envio não encontrado' });
      
      const shipment = { id: doc.id, ...doc.data() };
      
      if (!shipment.userId) return res.status(400).json({ error: 'Envio sem utilizador associado' });
      
      const userRecord = await auth.getUser(shipment.userId);
      if (!userRecord.email) return res.status(400).json({ error: 'Utilizador sem email' });

      await sendTrackingEmail(userRecord.email, shipment.id, shipment);
      
      res.json({ message: 'Email reenviado com sucesso' });
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      res.status(500).json({ error: 'Erro ao reenviar email' });
    }
  }

  async exportShipments(req, res) { res.status(501).json({ message: 'Not Implemented: exportShipments' }); }

  // Pedidos
  async getOrders(req, res) {
    try {
      const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(50).get();
      const orders = [];
      snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  async getOrderDetails(req, res) { res.status(501).json({ message: 'Not Implemented: getOrderDetails' }); }
  async updateOrder(req, res) { res.status(501).json({ message: 'Not Implemented: updateOrder' }); }
  async deleteOrder(req, res) { res.status(501).json({ message: 'Not Implemented: deleteOrder' }); }
  async exportOrders(req, res) { res.status(501).json({ message: 'Not Implemented: exportOrders' }); }

  // Produtos
  /**
   * (Admin) Obtém uma lista de todos os produtos com filtros e paginação.
   * Permite ver produtos com qualquer status.
   */
  async getProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category,
        status,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      let query = db.collection('products');

      if (category) query = query.where('category', '==', category);
      if (status) query = query.where('status', '==', status);

      const totalSnapshot = await query.count().get();
      const total = totalSnapshot.data().count;

      const productsSnapshot = await query
        .orderBy(sortBy, order)
        .limit(parseInt(limit))
        .offset((parseInt(page) - 1) * parseInt(limit))
        .get();

      const products = productsSnapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));

      res.json({
        success: true,
        products,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });

    } catch (error) {
      console.error("Erro (Admin) ao obter produtos:", error);
      res.status(500).json({ error: 'Erro ao obter produtos.' });
    }
  }
  async importProducts(req, res) { res.status(501).json({ message: 'Not Implemented: importProducts' }); }
  async exportProducts(req, res) { res.status(501).json({ message: 'Not Implemented: exportProducts' }); }

  // Personal Shopper
  async getPersonalShopperRequests(req, res) { res.status(501).json({ message: 'Not Implemented: getPersonalShopperRequests' }); }
  async updatePersonalShopperRequest(req, res) { res.status(501).json({ message: 'Not Implemented: updatePersonalShopperRequest' }); }

  // Configurações
  async getSettings(req, res) { res.status(501).json({ message: 'Not Implemented: getSettings' }); }
  async updateSettings(req, res) { res.status(501).json({ message: 'Not Implemented: updateSettings' }); }
  async updateEmailSettings(req, res) { res.status(501).json({ message: 'Not Implemented: updateEmailSettings' }); }
  async updatePaymentSettings(req, res) { res.status(501).json({ message: 'Not Implemented: updatePaymentSettings' }); }
  async updateShippingSettings(req, res) { res.status(501).json({ message: 'Not Implemented: updateShippingSettings' }); }

  // Logs
  async getLogs(req, res) { res.status(501).json({ message: 'Not Implemented: getLogs' }); }
  async getLogDetails(req, res) { res.status(501).json({ message: 'Not Implemented: getLogDetails' }); }
  async clearLogs(req, res) { res.status(501).json({ message: 'Not Implemented: clearLogs' }); }

  // Backup
  async createBackup(req, res) { res.status(501).json({ message: 'Not Implemented: createBackup' }); }
  async getBackups(req, res) { res.status(501).json({ message: 'Not Implemented: getBackups' }); }
  async restoreBackup(req, res) { res.status(501).json({ message: 'Not Implemented: restoreBackup' }); }
  async deleteBackup(req, res) { res.status(501).json({ message: 'Not Implemented: deleteBackup' }); }

  // Sistema
  async getSystemHealth(req, res) { res.status(501).json({ message: 'Not Implemented: getSystemHealth' }); }
  async getSystemInfo(req, res) { res.status(501).json({ message: 'Not Implemented: getSystemInfo' }); }
  async toggleMaintenance(req, res) { res.status(501).json({ message: 'Not Implemented: toggleMaintenance' }); }
  async clearCache(req, res) { res.status(501).json({ message: 'Not Implemented: clearCache' }); }

  // Relatórios
  async getSalesReport(req, res) { res.status(501).json({ message: 'Not Implemented: getSalesReport' }); }
  async getShipmentsReport(req, res) { res.status(501).json({ message: 'Not Implemented: getShipmentsReport' }); }
  async getUsersReport(req, res) { res.status(501).json({ message: 'Not Implemented: getUsersReport' }); }
  async getFinancialReport(req, res) { res.status(501).json({ message: 'Not Implemented: getFinancialReport' }); }
  async generateReport(req, res) { res.status(501).json({ message: 'Not Implemented: generateReport' }); }

  // API Keys
  async getApiKeys(req, res) { res.status(501).json({ message: 'Not Implemented: getApiKeys' }); }
  async createApiKey(req, res) { res.status(501).json({ message: 'Not Implemented: createApiKey' }); }
  async updateApiKey(req, res) { res.status(501).json({ message: 'Not Implemented: updateApiKey' }); }
  async deleteApiKey(req, res) { res.status(501).json({ message: 'Not Implemented: deleteApiKey' }); }

  // Notificações admin
  async getAdminNotifications(req, res) { res.status(501).json({ message: 'Not Implemented: getAdminNotifications' }); }
  async markAdminNotificationAsRead(req, res) { res.status(501).json({ message: 'Not Implemented: markAdminNotificationAsRead' }); }
}

module.exports = new AdminController();