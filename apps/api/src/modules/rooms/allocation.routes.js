const express = require('express');
const allocationController = require('./allocation.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { allocateRoomSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'WARDEN'), allocationController.getAllAllocations);
router.get('/my', authenticate, authorize('STUDENT'), allocationController.getMyAllocation);
router.get('/:id', authenticate, authorize('ADMIN', 'WARDEN'), allocationController.getAllocationById);

router.post('/', authenticate, authorize('ADMIN', 'WARDEN'), validate(allocateRoomSchema), allocationController.allocateRoom);
router.post('/smart-allocate', authenticate, authorize('ADMIN', 'WARDEN'), allocationController.smartAllocate);
router.post('/vacate/:id', authenticate, authorize('ADMIN', 'WARDEN'), allocationController.vacateRoom);

module.exports = router;
