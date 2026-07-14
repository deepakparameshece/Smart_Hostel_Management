const express = require('express');
const studentController = require('./student.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { updateStudentSchema } = require('shared');

const upload = require('../../utils/storage');

const router = express.Router();

router.get('/me', authenticate, authorize('STUDENT', 'ADMIN', 'WARDEN'), studentController.getMyProfile);
router.put('/me', authenticate, authorize('STUDENT', 'ADMIN', 'WARDEN'), studentController.updateMyProfile);
router.post('/me/avatar', authenticate, authorize('STUDENT', 'ADMIN', 'WARDEN'), upload.single('avatar'), studentController.uploadAvatar);

// Admin/Warden routes
router.get('/', authenticate, authorize('ADMIN', 'WARDEN'), studentController.getAllStudents);
router.get('/:id', authenticate, authorize('ADMIN', 'WARDEN'), studentController.getStudentById);
router.post('/:id/upload-id', authenticate, authorize('ADMIN'), upload.single('idProof'), studentController.uploadIdProof);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateStudentSchema), studentController.updateStudent);
router.delete('/:id', authenticate, authorize('ADMIN'), studentController.deleteStudent);

module.exports = router;
