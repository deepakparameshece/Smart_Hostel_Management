const { z } = require('zod');

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'WARDEN', 'STUDENT']).optional(),
    avatar: z.string().url().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6).optional(),
  }),
});

module.exports = {
  updateUserSchema,
};
