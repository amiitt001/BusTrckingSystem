const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

router.get('/', pagesController.getLandingPage);
router.get('/tracker', pagesController.getTrackerPage);
router.get('/driver', pagesController.getDriverPage);

module.exports = router;
