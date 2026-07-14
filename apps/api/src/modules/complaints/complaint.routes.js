const express = require('express');
const complaintController = require('./complaint.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createComplaintSchema, updateComplaintSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, complaintController.getAllComplaints);
router.get('/my', authenticate, authorize('STUDENT', 'ADMIN', 'WARDEN'), complaintController.getMyComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);

router.post('/', authenticate, validate(createComplaintSchema), complaintController.createComplaint);
router.put('/:id', authenticate, authorize('ADMIN', 'WARDEN'), validate(updateComplaintSchema), complaintController.updateComplaint);
router.post('/:id/resolve', authenticate, authorize('ADMIN', 'WARDEN'), complaintController.resolveComplaint);

module.exports = router;
