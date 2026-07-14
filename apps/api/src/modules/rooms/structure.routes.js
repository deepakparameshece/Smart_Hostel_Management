const express = require('express');
const prisma = require('../../config/database');
const { authenticate, authorize } = require('../../middleware/auth');
const router = express.Router();

// Get all blocks
router.get('/blocks', authenticate, async (req, res, next) => {
  try {
    const blocks = await prisma.block.findMany({
      include: { floors: true }
    });
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});

// Get all floors
router.get('/floors', authenticate, async (req, res, next) => {
  try {
    const floors = await prisma.floor.findMany({
      include: { block: true }
    });
    res.json(floors);
  } catch (error) {
    next(error);
  }
});

// Add a floor (Admin only)
router.post('/floors', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { floorNumber } = req.body;
    if (floorNumber === undefined) {
      return res.status(400).json({ error: "floorNumber is required" });
    }

    // 1. Get or create hostel
    let hostel = await prisma.hostel.findFirst();
    if (!hostel) {
      hostel = await prisma.hostel.create({
        data: {
          name: 'Main Campus Smart Hostel',
          address: 'Hostel Ave, University City',
          totalBlocks: 1
        }
      });
    }

    // 2. Get or create block
    let block = await prisma.block.findFirst({
      where: { hostelId: hostel.id }
    });
    if (!block) {
      block = await prisma.block.create({
        data: {
          hostelId: hostel.id,
          name: 'Block A',
          totalFloors: 1
        }
      });
    }

    // 3. Check if floor number already exists
    const existingFloor = await prisma.floor.findFirst({
      where: {
        blockId: block.id,
        floorNumber: parseInt(floorNumber)
      }
    });

    if (existingFloor) {
      return res.status(400).json({ error: "Floor number already exists" });
    }

    // 4. Create floor
    const newFloor = await prisma.floor.create({
      data: {
        blockId: block.id,
        floorNumber: parseInt(floorNumber)
      }
    });

    res.status(201).json(newFloor);
  } catch (error) {
    next(error);
  }
});

// Delete a floor (Admin only)
router.delete('/floors/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.floor.delete({
      where: { id }
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
