const { z } = require('zod');

const createFeeSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    amount: z.number().min(0),
    dueDate: z.string().datetime(),
    description: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const updatePaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: z.number().min(0).optional(),
    dueDate: z.string().datetime().optional(),
    paidDate: z.string().datetime().optional(),
    status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'PARTIAL', 'CANCELLED']).optional(),
    description: z.string().optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
});

module.exports = {
  createFeeSchema,
  updatePaymentSchema,
};
