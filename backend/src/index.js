require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const logger = require('./config/logger');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase
initializeFirebase();

// API Routes
app.use('/api', routes);

// Basic route for testing
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ message: 'Backend server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
