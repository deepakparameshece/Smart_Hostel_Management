const { z } = require('zod');

const createRoomSchema = z.object({
  body: z.object({
    floorId: z.string().uuid(),
    roomNumber: z.string(),
    type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']).default('DOUBLE'),
    capacity: z.number().int().min(1).default(2),
    monthlyRent: z.number().min(0).default(0),
    amenities: z.record(z.any()).optional(),
    description: z.string().optional(),
  }),
});

const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    roomNumber: z.string().optional(),
    type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']).optional(),
    capacity: z.number().int().min(1).optional(),
    monthlyRent: z.number().min(0).optional(),
    amenities: z.record(z.any()).optional(),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED']).optional(),
    description: z.string().optional(),
  }),
});

const allocateRoomSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    roomId: z.string().uuid(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});

module.exports = {
  createRoomSchema,
  updateRoomSchema,
  allocateRoomSchema,
};
