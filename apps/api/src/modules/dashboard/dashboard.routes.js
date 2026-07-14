const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, dashboardController.getStats);
router.get('/activities', authenticate, dashboardController.getRecentActivities);
router.get('/recent-activities', authenticate, dashboardController.getRecentActivities);

module.exports = router;
