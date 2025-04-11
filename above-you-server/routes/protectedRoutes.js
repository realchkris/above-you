const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.delete('/delete', authController.deleteAccount);

module.exports = router;
