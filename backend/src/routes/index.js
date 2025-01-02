const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categoryRoutes');
const urlRoutes = require('./urlRoutes');
const templateRoutes = require('./templateRoutes');
const campaignRoutes = require('./campaignRoutes');

// Rutas principales
router.use('/categories', categoryRoutes);
router.use('/urls', urlRoutes);
router.use('/templates', templateRoutes);
router.use('/campaigns', campaignRoutes);

module.exports = router;
