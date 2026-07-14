const express = require('express');
const visitorController = require('./visitor.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createVisitorSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'WARDEN'), visitorController.getAllVisitors);
router.get('/my', authenticate, authorize('STUDENT'), visitorController.getMyVisitors);
router.get('/:id', authenticate, visitorController.getVisitorById);

router.post('/', authenticate, validate(createVisitorSchema), visitorController.createVisitor);
router.put('/:id/check-out', authenticate, authorize('ADMIN', 'WARDEN'), visitorController.checkOutVisitor);

module.exports = router;
