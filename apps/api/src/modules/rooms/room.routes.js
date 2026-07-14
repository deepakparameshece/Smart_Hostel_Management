const express = require('express');
const roomController = require('./room.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createRoomSchema, updateRoomSchema } = require('shared');

const router = express.Router();

router.get('/', authenticate, roomController.getAllRooms);
router.get('/available', authenticate, roomController.getAvailableRooms);
router.get('/:id', authenticate, roomController.getRoomById);

// Admin/Warden only routes
router.post('/', authenticate, authorize('ADMIN'), validate(createRoomSchema), roomController.createRoom);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', authenticate, authorize('ADMIN'), roomController.deleteRoom);

module.exports = router;
