const express = require('express');
const attendanceController = require('./attendance.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { markAttendanceSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'WARDEN'), attendanceController.getAllAttendance);
router.get('/my', authenticate, authorize('STUDENT'), attendanceController.getMyAttendance);
router.post('/mark', authenticate, authorize('ADMIN', 'WARDEN'), validate(markAttendanceSchema), attendanceController.markAttendance);
router.post('/bulk-mark', authenticate, authorize('ADMIN', 'WARDEN'), attendanceController.bulkMarkAttendance);

module.exports = router;
