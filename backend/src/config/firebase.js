const admin = require('firebase-admin');
require('dotenv').config();

const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

module.exports = { initializeFirebase, admin };
