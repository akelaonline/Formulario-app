const { createDoc, updateDoc, deleteDoc, getDoc, queryDocs } = require('./firestore');
const logger = require('../config/logger');

class TemplateModel {
  static collection = 'templates';

  static async createTemplate(templateData) {
    try {
      return await createDoc(this.collection, templateData);
    } catch (error) {
      logger.error('Error creating template', { error, templateData });
      throw error;
    }
  }

  static async updateTemplate(id, templateData) {
    try {
      return await updateDoc(this.collection, id, templateData);
    } catch (error) {
      logger.error('Error updating template', { error, id, templateData });
      throw error;
    }
  }

  static async deleteTemplate(id) {
    try {
      return await deleteDoc(this.collection, id);
    } catch (error) {
      logger.error('Error deleting template', { error, id });
      throw error;
    }
  }

  static async getTemplateById(id) {
    try {
      return await getDoc(this.collection, id);
    } catch (error) {
      logger.error('Error getting template', { error, id });
      throw error;
    }
  }

  static async getTemplatesByUserId(userId) {
    try {
      return await queryDocs(this.collection, [
        { field: 'userId', operator: '==', value: userId }
      ]);
    } catch (error) {
      logger.error('Error getting templates by user', { error, userId });
      throw error;
    }
  }
}

module.exports = TemplateModel;
