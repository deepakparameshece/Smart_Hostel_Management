const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(3),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().min(3),
    password: z.string().min(3),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['ADMIN', 'WARDEN', 'STUDENT', 'MESS_MANAGER']).optional(),
    idType: z.string().optional(),
    idNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    purpose: z.string().optional(),
  }),
});

module.exports = {
  loginSchema,
  registerSchema,
};
