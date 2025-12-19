const Shipment = require('../models/Shipment');
const AdminLog = require('../models/AdminLog');

class ShipmentController {
  /**
   * Rastreia um envio publicamente usando o código de rastreamento.
   */
  async trackShipment(req, res) {
    try {
      const { trackingCode } = req.params;
      if (!trackingCode) {
        return res.status(400).json({ error: 'Código de rastreamento é obrigatório.' });
      }

      const shipment = await Shipment.findByTrackingCode(trackingCode.toUpperCase());

      if (!shipment) {
        return res.status(404).json({ error: 'Envio não encontrado.' });
      }

      res.json({ success: true, shipment });
    } catch (error) {
      console.error("Erro ao rastrear envio:", error);
      res.status(500).json({ error: 'Erro interno ao processar o seu pedido.' });
    }
  }

  /**
   * Cria um novo envio para o utilizador autenticado.
   * Protegido por middleware `isAuthenticated`.
   */
  async createShipment(req, res) {
    try {
      const shipmentData = {
        ...req.body,
        userId: req.user.uid, // UID do utilizador autenticado
        createdBy: req.user.uid,
        status: 'pending',
        trackingHistory: [{
          status: 'pending',
          location: req.body.sender?.address?.city || 'Origem',
          description: 'Pedido de envio criado.',
          timestamp: new Date(),
          isMilestone: true,
        }]
      };

      const newShipment = await Shipment.create(shipmentData);

      res.status(201).json({
        success: true,
        message: 'Envio criado com sucesso.',
        shipment: newShipment
      });
    } catch (error) {
      console.error("Erro ao criar envio:", error);
      res.status(400).json({ error: 'Erro ao criar o envio.', message: error.message });
    }
  }

  /**
   * Obtém todos os envios de um utilizador autenticado.
   * Protegido por middleware `isAuthenticated`.
   */
  async getUserShipments(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.uid;

      const result = await Shipment.findForUser({
        userId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Erro ao obter envios do utilizador:", error);
      res.status(500).json({ error: 'Erro ao obter os seus envios.' });
    }
  }

  /**
   * (Admin/Staff) Atualiza o status de um envio.
   * Protegido por `isAuthenticated` e `hasRole(['admin', 'staff'])`.
   */
  async updateShipmentStatus(req, res) {
    try {
      const { shipmentId } = req.params;
      const { status, location, description, isMilestone } = req.body;

      const shipment = await Shipment.findById(shipmentId);
      if (!shipment) {
        return res.status(404).json({ error: 'Envio não encontrado.' });
      }

      await shipment.addTrackingEvent(status, location, description, isMilestone);

      // Registar a ação do admin/staff
      await AdminLog.log({
        userId: req.user.uid,
        action: 'update',
        entity: 'shipment',
        entityId: shipment.id,
        description: `Status do envio #${shipment.trackingCode} atualizado para "${status}".`,
        details: { newStatus: status, location }
      });

      // TODO: Enviar notificação para o utilizador sobre a atualização
      // await NotificationService.sendTrackingUpdate(shipment);

      res.json({ success: true, message: 'Status do envio atualizado.', shipment });
    } catch (error) {
      console.error("Erro ao atualizar status do envio:", error);
      res.status(500).json({ error: 'Erro ao atualizar o status do envio.' });
    }
  }
}

module.exports = new ShipmentController();