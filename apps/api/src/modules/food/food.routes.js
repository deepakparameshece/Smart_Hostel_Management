const express = require('express');
const foodController = require('./food.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/options', authenticate, foodController.getOptions);
router.post('/options', authenticate, authorize('MESS_MANAGER', 'ADMIN', 'WARDEN'), foodController.createOption);
router.delete('/options/:id', authenticate, authorize('MESS_MANAGER', 'ADMIN', 'WARDEN'), foodController.deleteOption);
router.get('/poll', authenticate, authorize('STUDENT', 'MESS_MANAGER', 'ADMIN', 'WARDEN'), foodController.getPoll);
router.post('/vote', authenticate, authorize('STUDENT'), foodController.vote);
router.get('/results', authenticate, foodController.getWinners);
router.get('/stats', authenticate, authorize('MESS_MANAGER', 'ADMIN', 'WARDEN'), foodController.getStats);
router.post('/finalize', authenticate, authorize('MESS_MANAGER', 'ADMIN', 'WARDEN'), foodController.finalizeMenu);

module.exports = router;
