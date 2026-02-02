const { z } = require('zod');

// ============================================
// AUTH VALIDATION SCHEMAS (Zod)
// ============================================

// Register with email/password
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
});

// Login with email/password
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// OAuth login (Google/Apple/Facebook)
const oauthSchema = z.object({
  provider: z.enum(['google', 'apple', 'facebook'], {
    required_error: 'Provider is required',
    invalid_type_error: 'Provider must be google, apple, or facebook',
  }),
  idToken: z.string().min(1).optional(),
  accessToken: z.string().min(1).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  photoUrl: z.string().url().optional().nullable(),
}).refine((data) => data.idToken || data.accessToken, {
  message: 'Either idToken or accessToken is required',
  path: ['idToken'],
});

// Set user role
const setRoleSchema = z.object({
  role: z.enum(['student', 'teacher'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be student or teacher',
  }),
});

// Update profile
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .optional(),
  photoUrl: z.string().url('Invalid photo URL').optional().nullable(),
});

module.exports = {
  registerSchema,
  loginSchema,
  oauthSchema,
  setRoleSchema,
  updateProfileSchema,
};
