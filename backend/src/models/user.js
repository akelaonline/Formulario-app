const { createDoc, updateDoc, deleteDoc, getDoc, queryDocs } = require('./firestore');
const logger = require('../config/logger');

class UserModel {
  static collection = 'users';

  static async createUser(userData) {
    try {
      return await createDoc(this.collection, userData);
    } catch (error) {
      logger.error('Error creating user', { error, userData });
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      return await updateDoc(this.collection, id, userData);
    } catch (error) {
      logger.error('Error updating user', { error, id, userData });
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      return await deleteDoc(this.collection, id);
    } catch (error) {
      logger.error('Error deleting user', { error, id });
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      return await getDoc(this.collection, id);
    } catch (error) {
      logger.error('Error getting user', { error, id });
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const users = await queryDocs(this.collection, [
        { field: 'email', operator: '==', value: email }
      ]);
      return users[0] || null;
    } catch (error) {
      logger.error('Error getting user by email', { error, email });
      throw error;
    }
  }
}

module.exports = UserModel;
