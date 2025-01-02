const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de URLs
router.get('/', urlController.getUrls);
router.get('/:id', urlController.getUrl);
router.post('/', urlController.createUrl);
router.put('/:id', urlController.updateUrl);
router.delete('/:id', urlController.deleteUrl);
router.put('/:id/status', urlController.updateUrlStatus);

module.exports = router;
