const express = require('express');
const router = express.Router();
const { reverseGeocode } = require('../controllers/geocodeController');

// /api/geocode?lat=...&lon=...
router.get('/', reverseGeocode);

module.exports = router;