const express = require('express');
const router = express.Router();
const celestialController = require('../controllers/celestialController');

// /api/celestial?lat=...&lon=...
router.get('/', celestialController.getCelestialData);

module.exports = router;