const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const prisma = require('../../config/database');
const billService = require('./bill.service');

const router = express.Router();

// Get all bills (Admin)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const bills = await prisma.electricityBill.findMany({
      include: {
        room: {
          select: { roomNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/Generate bill (Admin/IoT Mock)
router.post('/generate', authenticate, authorize('ADMIN', 'WARDEN'), async (req, res) => {
  try {
    const { roomId, month, year, unitsConsumed, ratePerUnit } = req.body;
    const bill = await billService.generateBillAndSplit({ roomId, month, year, unitsConsumed, ratePerUnit });
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
