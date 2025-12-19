class PersonalShopperController {

  // --- Métodos para Clientes ---
  async createRequest(req, res) { res.status(501).json({ message: 'Not Implemented: createRequest' }); }
  async getMyRequests(req, res) { res.status(501).json({ message: 'Not Implemented: getMyRequests' }); }
  async getMyRequestById(req, res) { res.status(501).json({ message: 'Not Implemented: getMyRequestById' }); }
  async cancelRequest(req, res) { res.status(501).json({ message: 'Not Implemented: cancelRequest' }); }
  async sendMessage(req, res) { res.status(501).json({ message: 'Not Implemented: sendMessage' }); }

  // --- Métodos para Staff ---
  async getAllRequests(req, res) { res.status(501).json({ message: 'Not Implemented: getAllRequests' }); }
  async getAssignedRequests(req, res) { res.status(501).json({ message: 'Not Implemented: getAssignedRequests' }); }
  async assignRequest(req, res) { res.status(501).json({ message: 'Not Implemented: assignRequest' }); }
  async updateRequestStatus(req, res) { res.status(501).json({ message: 'Not Implemented: updateRequestStatus' }); }
  async sendStaffMessage(req, res) { res.status(501).json({ message: 'Not Implemented: sendStaffMessage' }); }
  async addSearchResult(req, res) { res.status(501).json({ message: 'Not Implemented: addSearchResult' }); }
  async selectOption(req, res) { res.status(501).json({ message: 'Not Implemented: selectOption' }); }

  // --- Métodos para Admin ---
  async getStats(req, res) { res.status(501).json({ message: 'Not Implemented: getStats' }); }
  async getRequestById(req, res) { res.status(501).json({ message: 'Not Implemented: getRequestById' }); }
  async adminUpdateRequest(req, res) { res.status(501).json({ message: 'Not Implemented: adminUpdateRequest' }); }
  async deleteRequest(req, res) { res.status(501).json({ message: 'Not Implemented: deleteRequest' }); }

  // --- Métodos Públicos ---
  async getServiceInfo(req, res) { res.status(501).json({ message: 'Not Implemented: getServiceInfo' }); }
  async getFAQ(req, res) { res.status(501).json({ message: 'Not Implemented: getFAQ' }); }

}

module.exports = new PersonalShopperController();