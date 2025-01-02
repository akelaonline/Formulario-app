const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de campañas
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaign);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.put('/:id/status', campaignController.updateCampaignStatus);
router.put('/:id/url-status', campaignController.updateCampaignUrlStatus);

module.exports = router;
