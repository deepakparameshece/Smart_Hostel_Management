const { z } = require('zod');

const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    idType: z.string().optional(),
    idNumber: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    course: z.string().optional(),
    year: z.number().int().optional(),
    status: z.string().optional(),
    purpose: z.string().optional(),
  }),
});

module.exports = {
  updateStudentSchema,
};
