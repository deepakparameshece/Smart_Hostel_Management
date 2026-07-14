const express = require('express');
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { updateUserSchema } = require('shared');

const router = express.Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/notifications/my', authenticate, userController.getMyNotifications);
router.put('/notifications/mark-read', authenticate, userController.markNotificationsRead);

// Admin only routes
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
