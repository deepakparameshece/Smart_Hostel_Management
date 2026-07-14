const express = require('express');
const feeController = require('./fee.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createFeeSchema, updatePaymentSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'WARDEN'), feeController.getAllPayments);
router.get('/my', authenticate, authorize('STUDENT'), feeController.getMyPayments);
router.get('/overdue', authenticate, authorize('ADMIN', 'WARDEN'), feeController.getOverduePayments);
router.get('/:id', authenticate, feeController.getPaymentById);

router.post('/', authenticate, authorize('ADMIN'), validate(createFeeSchema), feeController.createPayment);
router.post('/generate-monthly', authenticate, authorize('ADMIN'), feeController.generateMonthlyInvoices);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updatePaymentSchema), feeController.updatePayment);
router.post('/:id/pay', authenticate, authorize('STUDENT', 'ADMIN'), feeController.processPayment);

module.exports = router;
