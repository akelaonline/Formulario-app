const { admin } = require('../config/firebase');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    logger.info('User authenticated', { uid: req.user.uid });
    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
