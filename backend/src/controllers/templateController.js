const { TemplateModel } = require('../models');
const logger = require('../config/logger');

const templateController = {
  // Obtener todas las plantillas del usuario
  async getTemplates(req, res) {
    try {
      const templates = await TemplateModel.getTemplatesByUserId(req.user.uid);
      res.json(templates);
    } catch (error) {
      logger.error('Error getting templates', { error, userId: req.user.uid });
      res.status(500).json({ error: 'Error getting templates' });
    }
  },

  // Obtener una plantilla específica
  async getTemplate(req, res) {
    try {
      const template = await TemplateModel.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      if (template.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      res.json(template);
    } catch (error) {
      logger.error('Error getting template', { error, templateId: req.params.id });
      res.status(500).json({ error: 'Error getting template' });
    }
  },

  // Crear una nueva plantilla
  async createTemplate(req, res) {
    try {
      const templateData = {
        ...req.body,
        userId: req.user.uid
      };
      const template = await TemplateModel.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      logger.error('Error creating template', { error, data: req.body });
      res.status(500).json({ error: 'Error creating template' });
    }
  },

  // Actualizar una plantilla
  async updateTemplate(req, res) {
    try {
      const template = await TemplateModel.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      if (template.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedTemplate = await TemplateModel.updateTemplate(req.params.id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      logger.error('Error updating template', { error, templateId: req.params.id });
      res.status(500).json({ error: 'Error updating template' });
    }
  },

  // Eliminar una plantilla
  async deleteTemplate(req, res) {
    try {
      const template = await TemplateModel.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      if (template.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await TemplateModel.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting template', { error, templateId: req.params.id });
      res.status(500).json({ error: 'Error deleting template' });
    }
  }
};

module.exports = templateController;
