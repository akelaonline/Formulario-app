const { admin } = require('../config/firebase');
const logger = require('../config/logger');

const db = admin.firestore();

// Colecciones base
const collections = {
  users: db.collection('users'),
  categories: db.collection('categories'),
  urls: db.collection('urls'),
  templates: db.collection('templates'),
  campaigns: db.collection('campaigns')
};

// Funciones helper para operaciones comunes
const timestamp = () => admin.firestore.FieldValue.serverTimestamp();

const createDoc = async (collection, data) => {
  try {
    const docRef = await collections[collection].add({
      ...data,
      createdAt: timestamp(),
      updatedAt: timestamp()
    });
    logger.info(`Created document in ${collection}`, { docId: docRef.id });
    return { id: docRef.id, ...data };
  } catch (error) {
    logger.error(`Error creating document in ${collection}`, { error });
    throw error;
  }
};

const updateDoc = async (collection, id, data) => {
  try {
    const docRef = collections[collection].doc(id);
    await docRef.update({
      ...data,
      updatedAt: timestamp()
    });
    logger.info(`Updated document in ${collection}`, { docId: id });
    return { id, ...data };
  } catch (error) {
    logger.error(`Error updating document in ${collection}`, { error });
    throw error;
  }
};

const deleteDoc = async (collection, id) => {
  try {
    await collections[collection].doc(id).delete();
    logger.info(`Deleted document in ${collection}`, { docId: id });
    return true;
  } catch (error) {
    logger.error(`Error deleting document in ${collection}`, { error });
    throw error;
  }
};

const getDoc = async (collection, id) => {
  try {
    const doc = await collections[collection].doc(id).get();
    if (!doc.exists) {
      logger.warn(`Document not found in ${collection}`, { docId: id });
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    logger.error(`Error getting document from ${collection}`, { error });
    throw error;
  }
};

const queryDocs = async (collection, filters = []) => {
  try {
    let query = collections[collection];
    
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    logger.error(`Error querying documents from ${collection}`, { error });
    throw error;
  }
};

module.exports = {
  db,
  collections,
  createDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  queryDocs
};
