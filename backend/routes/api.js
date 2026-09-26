const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

// Farmer Routes
router.post('/farmer/login', farmerController.loginFarmer);
router.get('/centres/recommend', farmerController.recommendCentres);
router.post('/slots/book', farmerController.bookSlot);

module.exports = router;
