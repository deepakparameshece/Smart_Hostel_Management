const { z } = require('zod');

// Complaint Validators
const createComplaintSchema = z.object({
  body: z.object({
    category: z.enum(['PLUMBING', 'ELECTRICAL', 'HOUSEKEEPING', 'SECURITY', 'FOOD', 'WIFI', 'FURNITURE', 'OTHER']).default('OTHER'),
    title: z.string().min(3),
    description: z.string().min(10),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  }),
});

const updateComplaintSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedToId: z.string().uuid().optional(),
    resolution: z.string().optional(),
  }),
});

// Visitor Validators
const createVisitorSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    visitorName: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    purpose: z.string().optional(),
  }),
});

// Attendance Validators
const markAttendanceSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    status: z.enum(['PRESENT', 'ABSENT', 'LEAVE', 'LATE']).default('PRESENT'),
    notes: z.string().optional(),
  }),
});

module.exports = {
  createComplaintSchema,
  updateComplaintSchema,
  createVisitorSchema,
  markAttendanceSchema,
};
