const { UrlModel } = require('../models');
const logger = require('../config/logger');

const urlController = {
  // Obtener URLs por categoría
  async getUrls(req, res) {
    try {
      const urls = await UrlModel.getUrlsByCategory(req.query.categoryId, req.user.uid);
      res.json(urls);
    } catch (error) {
      logger.error('Error getting URLs', { error, categoryId: req.query.categoryId });
      res.status(500).json({ error: 'Error getting URLs' });
    }
  },

  // Obtener una URL específica
  async getUrl(req, res) {
    try {
      const url = await UrlModel.getUrlById(req.params.id);
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      if (url.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      res.json(url);
    } catch (error) {
      logger.error('Error getting URL', { error, urlId: req.params.id });
      res.status(500).json({ error: 'Error getting URL' });
    }
  },

  // Crear una nueva URL
  async createUrl(req, res) {
    try {
      const urlData = {
        ...req.body,
        userId: req.user.uid,
        status: 'pending'
      };
      const url = await UrlModel.createUrl(urlData);
      res.status(201).json(url);
    } catch (error) {
      logger.error('Error creating URL', { error, data: req.body });
      res.status(500).json({ error: 'Error creating URL' });
    }
  },

  // Actualizar una URL
  async updateUrl(req, res) {
    try {
      const url = await UrlModel.getUrlById(req.params.id);
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      if (url.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedUrl = await UrlModel.updateUrl(req.params.id, req.body);
      res.json(updatedUrl);
    } catch (error) {
      logger.error('Error updating URL', { error, urlId: req.params.id });
      res.status(500).json({ error: 'Error updating URL' });
    }
  },

  // Eliminar una URL
  async deleteUrl(req, res) {
    try {
      const url = await UrlModel.getUrlById(req.params.id);
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      if (url.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await UrlModel.deleteUrl(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting URL', { error, urlId: req.params.id });
      res.status(500).json({ error: 'Error deleting URL' });
    }
  },

  // Actualizar estado de una URL
  async updateUrlStatus(req, res) {
    try {
      const { status, error } = req.body;
      const url = await UrlModel.getUrlById(req.params.id);
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      if (url.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedUrl = await UrlModel.updateUrlStatus(req.params.id, status, error);
      res.json(updatedUrl);
    } catch (error) {
      logger.error('Error updating URL status', { error, urlId: req.params.id });
      res.status(500).json({ error: 'Error updating URL status' });
    }
  }
};

module.exports = urlController;
