const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// /api/weather?lat=...&lon=...
router.get('/', weatherController.getWeather);

module.exports = router;