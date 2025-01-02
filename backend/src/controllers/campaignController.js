const { CampaignModel } = require('../models');
const logger = require('../config/logger');

const campaignController = {
  // Obtener todas las campañas del usuario
  async getCampaigns(req, res) {
    try {
      const campaigns = await CampaignModel.getCampaignsByUserId(req.user.uid);
      res.json(campaigns);
    } catch (error) {
      logger.error('Error getting campaigns', { error, userId: req.user.uid });
      res.status(500).json({ error: 'Error getting campaigns' });
    }
  },

  // Obtener una campaña específica
  async getCampaign(req, res) {
    try {
      const campaign = await CampaignModel.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      res.json(campaign);
    } catch (error) {
      logger.error('Error getting campaign', { error, campaignId: req.params.id });
      res.status(500).json({ error: 'Error getting campaign' });
    }
  },

  // Crear una nueva campaña
  async createCampaign(req, res) {
    try {
      const campaignData = {
        ...req.body,
        userId: req.user.uid,
        status: 'draft'
      };
      const campaign = await CampaignModel.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      logger.error('Error creating campaign', { error, data: req.body });
      res.status(500).json({ error: 'Error creating campaign' });
    }
  },

  // Actualizar una campaña
  async updateCampaign(req, res) {
    try {
      const campaign = await CampaignModel.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedCampaign = await CampaignModel.updateCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      logger.error('Error updating campaign', { error, campaignId: req.params.id });
      res.status(500).json({ error: 'Error updating campaign' });
    }
  },

  // Eliminar una campaña
  async deleteCampaign(req, res) {
    try {
      const campaign = await CampaignModel.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await CampaignModel.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting campaign', { error, campaignId: req.params.id });
      res.status(500).json({ error: 'Error deleting campaign' });
    }
  },

  // Actualizar estado de una campaña
  async updateCampaignStatus(req, res) {
    try {
      const { status } = req.body;
      const campaign = await CampaignModel.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedCampaign = await CampaignModel.updateCampaignStatus(req.params.id, status);
      res.json(updatedCampaign);
    } catch (error) {
      logger.error('Error updating campaign status', { error, campaignId: req.params.id });
      res.status(500).json({ error: 'Error updating campaign status' });
    }
  },

  // Actualizar estado de una URL en una campaña
  async updateCampaignUrlStatus(req, res) {
    try {
      const { urlId, status, error } = req.body;
      const campaign = await CampaignModel.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedCampaign = await CampaignModel.updateUrlInCampaign(
        req.params.id,
        urlId,
        status,
        error
      );
      res.json(updatedCampaign);
    } catch (error) {
      logger.error('Error updating campaign URL status', {
        error,
        campaignId: req.params.id,
        urlId: req.body.urlId
      });
      res.status(500).json({ error: 'Error updating campaign URL status' });
    }
  }
};

module.exports = campaignController;
