const { createDoc, updateDoc, deleteDoc, getDoc, queryDocs } = require('./firestore');
const logger = require('../config/logger');

class CategoryModel {
  static collection = 'categories';

  static async createCategory(categoryData) {
    try {
      return await createDoc(this.collection, categoryData);
    } catch (error) {
      logger.error('Error creating category', { error, categoryData });
      throw error;
    }
  }

  static async updateCategory(id, categoryData) {
    try {
      return await updateDoc(this.collection, id, categoryData);
    } catch (error) {
      logger.error('Error updating category', { error, id, categoryData });
      throw error;
    }
  }

  static async deleteCategory(id) {
    try {
      return await deleteDoc(this.collection, id);
    } catch (error) {
      logger.error('Error deleting category', { error, id });
      throw error;
    }
  }

  static async getCategoryById(id) {
    try {
      return await getDoc(this.collection, id);
    } catch (error) {
      logger.error('Error getting category', { error, id });
      throw error;
    }
  }

  static async getCategoriesByUserId(userId) {
    try {
      return await queryDocs(this.collection, [
        { field: 'userId', operator: '==', value: userId }
      ]);
    } catch (error) {
      logger.error('Error getting categories by user', { error, userId });
      throw error;
    }
  }
}

module.exports = CategoryModel;
