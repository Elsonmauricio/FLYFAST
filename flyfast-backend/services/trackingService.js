const Shipment = require('../models/Shipment');
const NotificationService = require('./notificationService');
const { emitTrackingUpdate } = require('../config/socket');

class TrackingService {
  /**
   * Atualiza o status de um envio
   * @param {string} trackingCode - Código de rastreio
   * @param {string} status - Novo status
   * @param {Object} updateData - Dados adicionais
   * @returns {Promise<Object>} Envio atualizado
   */
  async updateShipmentStatus(trackingCode, status, updateData = {}) {
    try {
      const shipment = await Shipment.findOne({ trackingCode });
      
      if (!shipment) {
        throw new Error(`Envio não encontrado: ${trackingCode}`);
      }

      // Adicionar ao histórico
      const trackingEvent = {
        status,
        location: updateData.location || shipment.currentLocation,
        description: updateData.description || `Status atualizado para: ${status}`,
        isMilestone: updateData.isMilestone || false,
        date: new Date().toISOString() // Garante que a data/hora exata do evento é registada em formato ISO
      };

      shipment.trackingHistory.push(trackingEvent);
      shipment.status = status;
      
      // Atualizar localização atual se fornecida
      if (updateData.location) {
        shipment.currentLocation = updateData.location;
      }
      
      if (updateData.coordinates) {
        shipment.currentLocation.coordinates = updateData.coordinates;
      }
      
      if (updateData.notes) {
        shipment.notes = updateData.notes;
      }
      
      // Atualizar timestamp
      shipment.updatedAt = new Date();
      
      await shipment.save();
      
      // Enviar notificações
      await this.sendTrackingNotifications(shipment);
      
      // Emitir atualização via Socket.io
      emitTrackingUpdate(trackingCode, {
        status,
        location: shipment.currentLocation,
        timestamp: new Date(),
        event: trackingEvent
      });
      
      console.log(`✅ Status atualizado para envio ${trackingCode}: ${status}`);
      
      return {
        success: true,
        shipment,
        event: trackingEvent
      };
      
    } catch (error) {
      console.error('❌ Error updating shipment status:', error);
      throw error;
    }
  }

  /**
   * Cria um novo evento de milestone
   * @param {string} trackingCode - Código de rastreio
   * @param {string} milestone - Nome do milestone
   * @param {Object} data - Dados adicionais
   * @returns {Promise<Object>} Resultado
   */
  async addMilestone(trackingCode, milestone, data = {}) {
    const milestones = {
      'collected': {
        status: 'collected',
        description: 'Pacote recolhido pelo transportador',
        isMilestone: true
      },
      'departed': {
        status: 'in_transit',
        description: 'Pacote partiu para destino',
        isMilestone: true
      },
      'arrived_destination': {
        status: 'arrived_destination',
        description: 'Pacote chegou ao país de destino',
        isMilestone: true
      },
      'customs_cleared': {
        status: 'in_transit',
        description: 'Pacote liberado pela alfândega',
        isMilestone: true
      },
      'out_for_delivery': {
        status: 'out_for_delivery',
        description: 'Saiu para entrega',
        isMilestone: true
      },
      'delivery_attempted': {
        status: 'in_transit',
        description: 'Tentativa de entrega falhada',
        isMilestone: true
      },
      'delivered': {
        status: 'delivered',
        description: 'Pacote entregue com sucesso',
        isMilestone: true
      }
    };

    const milestoneData = milestones[milestone];
    
    if (!milestoneData) {
      throw new Error(`Milestone desconhecido: ${milestone}`);
    }

    // Combinar com dados adicionais
    const updateData = {
      ...milestoneData,
      ...data,
      description: data.description || milestoneData.description
    };

    return this.updateShipmentStatus(trackingCode, updateData.status, updateData);
  }

  /**
   * Envia notificações relacionadas ao tracking
   * @param {Object} shipment - Dados do envio
   */
  async sendTrackingNotifications(shipment) {
    try {
      const user = await require('../models/User').findById(shipment.userId);
      
      if (!user) return;
      
      // Verificar preferências do usuário
      const preferences = user.preferences.notifications;
      
      // Notificação por email
      if (preferences.email) {
        const emailService = require('./emailService');
        await emailService.sendTrackingUpdate(shipment, user);
      }
      
      // Notificação por WhatsApp
      if (preferences.whatsapp && user.phone) {
        const whatsappService = require('./whatsappService');
        await whatsappService.sendTrackingUpdate(user.phone, shipment);
      }
      
      // Notificação por SMS
      if (preferences.sms && user.phone) {
        const smsService = require('./smsService');
        await smsService.sendTrackingUpdate(user.phone, shipment);
      }
      
      // Notificação push (se implementado)
      if (preferences.push && user.firebaseUid) {
        // Implementar notificações push via Firebase
      }
      
      // Criar notificação no banco de dados
      const Notification = require('../models/Notification');
      const notification = new Notification({
        userId: user._id,
        type: 'tracking_update',
        title: '📦 Atualização do seu envio',
        message: `O seu envio #${shipment.trackingCode} está agora: ${shipment.status}`,
        data: {
          trackingCode: shipment.trackingCode,
          status: shipment.status,
          location: shipment.currentLocation,
          shipmentId: shipment._id
        },
        status: 'sent'
      });
      
      await notification.save();
      
    } catch (error) {
      console.error('❌ Error sending tracking notifications:', error);
    }
  }

  /**
   * Obtém o histórico completo de um envio
   * @param {string} trackingCode - Código de rastreio
   * @returns {Promise<Object>} Histórico do envio
   */
  async getTrackingHistory(trackingCode) {
    try {
      const shipment = await Shipment.findOne({ trackingCode })
        .populate('userId', 'name email phone')
        .select('trackingHistory status currentLocation estimatedDelivery');
      
      if (!shipment) {
        throw new Error(`Envio não encontrado: ${trackingCode}`);
      }
      
      return {
        success: true,
        trackingCode,
        status: shipment.status,
        currentLocation: shipment.currentLocation,
        estimatedDelivery: shipment.estimatedDelivery,
        history: shipment.trackingHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
        user: shipment.userId
      };
      
    } catch (error) {
      console.error('❌ Error getting tracking history:', error);
      throw error;
    }
  }

  /**
   * Calcula estatísticas de tracking
   * @param {string} userId - ID do usuário (opcional)
   * @returns {Promise<Object>} Estatísticas
   */
  async getTrackingStats(userId = null) {
    try {
      const query = userId ? { userId } : {};
      
      const stats = await Shipment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDeliveryTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'delivered'] },
                  { $divide: [
                    { $subtract: ['$actualDelivery', '$createdAt'] },
                    1000 * 60 * 60 * 24 // Converter para dias
                  ]},
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            avgDeliveryTime: { $round: ['$avgDeliveryTime', 1] },
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      const total = await Shipment.countDocuments(query);
      const delivered = await Shipment.countDocuments({ ...query, status: 'delivered' });
      const inTransit = await Shipment.countDocuments({ ...query, status: 'in_transit' });
      
      return {
        success: true,
        total,
        delivered,
        inTransit,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        stats
      };
      
    } catch (error) {
      console.error('❌ Error getting tracking stats:', error);
      throw error;
    }
  }

  /**
   * Simula o progresso de um envio (para desenvolvimento)
   * @param {string} trackingCode - Código de rastreio
   * @param {number} intervalMinutes - Intervalo entre atualizações
   * @returns {Promise<Object>} Resultado da simulação
   */
  async simulateTracking(trackingCode, intervalMinutes = 5) {
    try {
      const shipment = await Shipment.findOne({ trackingCode });
      
      if (!shipment) {
        throw new Error(`Envio não encontrado: ${trackingCode}`);
      }
      
      const simulationSteps = [
        {
          milestone: 'collected',
          location: 'Loja FLYFAST Luanda',
          description: 'Pacote recolhido para processamento'
        },
        {
          milestone: 'departed',
          location: 'Aeroporto 4 de Fevereiro',
          description: 'Pacote embarcado no voo para Lisboa'
        },
        {
          milestone: 'arrived_destination',
          location: 'Aeroporto Humberto Delgado',
          description: 'Pacote chegou a Lisboa'
        },
        {
          milestone: 'customs_cleared',
          location: 'Alfândega de Lisboa',
          description: 'Pacote liberado pela alfândega'
        },
        {
          milestone: 'out_for_delivery',
          location: 'Centro de Distribuição Lisboa',
          description: 'Saiu para entrega'
        },
        {
          milestone: 'delivered',
          location: shipment.recipient.address.street,
          description: 'Pacote entregue com sucesso'
        }
      ];
      
      const results = [];
      let delay = 0;
      
      for (const step of simulationSteps) {
        // Aguardar intervalo
        await new Promise(resolve => 
          setTimeout(resolve, intervalMinutes * 60 * 1000)
        );
        
        // Atualizar milestone
        const result = await this.addMilestone(trackingCode, step.milestone, {
          location: step.location,
          description: step.description
        });
        
        results.push({
          step: step.milestone,
          result,
          timestamp: new Date()
        });
        
        delay += intervalMinutes;
      }
      
      return {
        success: true,
        trackingCode,
        simulationDuration: `${delay} minutos`,
        steps: results
      };
      
    } catch (error) {
      console.error('❌ Error simulating tracking:', error);
      throw error;
    }
  }
}

module.exports = new TrackingService();