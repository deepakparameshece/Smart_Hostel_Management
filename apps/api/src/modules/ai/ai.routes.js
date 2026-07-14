const express = require('express');
const { authenticate } = require('../../middleware/auth');
const aiService = require('./ai.service');

const router = express.Router();

router.post('/chatbot', authenticate, aiService.handleChat);
router.get('/fee-prediction/:studentId', authenticate, aiService.getPaymentRisk);
router.post('/smart-allocation', authenticate, aiService.suggestRoomAllocation);

module.exports = router;
