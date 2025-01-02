const { createDoc, updateDoc, deleteDoc, getDoc, queryDocs } = require('./firestore');
const logger = require('../config/logger');

class UrlModel {
  static collection = 'urls';

  static async createUrl(urlData) {
    try {
      return await createDoc(this.collection, {
        ...urlData,
        status: 'pending'
      });
    } catch (error) {
      logger.error('Error creating URL', { error, urlData });
      throw error;
    }
  }

  static async updateUrl(id, urlData) {
    try {
      return await updateDoc(this.collection, id, urlData);
    } catch (error) {
      logger.error('Error updating URL', { error, id, urlData });
      throw error;
    }
  }

  static async deleteUrl(id) {
    try {
      return await deleteDoc(this.collection, id);
    } catch (error) {
      logger.error('Error deleting URL', { error, id });
      throw error;
    }
  }

  static async getUrlById(id) {
    try {
      return await getDoc(this.collection, id);
    } catch (error) {
      logger.error('Error getting URL', { error, id });
      throw error;
    }
  }

  static async getUrlsByCategory(categoryId, userId) {
    try {
      return await queryDocs(this.collection, [
        { field: 'categoryId', operator: '==', value: categoryId },
        { field: 'userId', operator: '==', value: userId }
      ]);
    } catch (error) {
      logger.error('Error getting URLs by category', { error, categoryId, userId });
      throw error;
    }
  }

  static async updateUrlStatus(id, status, error = null) {
    try {
      const updateData = {
        status,
        lastProcessed: new Date(),
        ...(error && { error })
      };
      return await this.updateUrl(id, updateData);
    } catch (error) {
      logger.error('Error updating URL status', { error, id, status });
      throw error;
    }
  }
}

module.exports = UrlModel;
