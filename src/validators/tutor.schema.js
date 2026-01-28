const { z } = require('zod');

// ============================================
// TUTOR VALIDATION SCHEMAS (Zod)
// ============================================

// Availability slot schema
const availabilitySlotSchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], {
    required_error: 'Day is required',
    invalid_type_error: 'Invalid day of week',
  }),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
  endTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
});

// Proficiency level enum
const proficiencyLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
  invalid_type_error: 'Proficiency level must be beginner, intermediate, advanced, or expert',
});

// Create/Update tutor profile (onboarding)
const createTutorSchema = z.object({
  instrument: z
    .string()
    .min(1, 'Instrument is required')
    .max(100, 'Instrument must be less than 100 characters')
    .default('Mridangam'),
  proficiencyLevel: proficiencyLevelEnum,
  hourlyRate: z
    .number({ required_error: 'Hourly rate is required' })
    .positive('Hourly rate must be positive')
    .max(1000, 'Hourly rate must be less than 1000'),
  city: z
    .string({ required_error: 'City is required' })
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z
    .string({ required_error: 'State is required' })
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters')
    .trim(),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .trim()
    .default('India')
    .optional(),
  bio: z
    .string({ required_error: 'Bio is required' })
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio must be less than 2000 characters')
    .trim(),
  availability: z
    .array(availabilitySlotSchema)
    .min(1, 'At least one availability slot is required'),
  isOnline: z.boolean().optional().default(false),
  yearsOfExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(100, 'Years of experience must be less than 100')
    .optional()
    .default(0),
});

// Update tutor profile (partial update)
const updateTutorSchema = createTutorSchema.partial();

// Update availability only
const updateAvailabilitySchema = z.object({
  availability: z
    .array(availabilitySlotSchema)
    .min(1, 'At least one availability slot is required'),
});

// Query params for listing tutors
const listTutorsQuerySchema = z.object({
  instrument: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minRate: z.coerce.number().positive().optional(),
  maxRate: z.coerce.number().positive().optional(),
  proficiencyLevel: proficiencyLevelEnum.optional(),
  isOnline: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sortBy: z.enum(['rating', 'hourlyRate', 'yearsOfExperience', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createTutorSchema,
  updateTutorSchema,
  updateAvailabilitySchema,
  listTutorsQuerySchema,
  availabilitySlotSchema,
  proficiencyLevelEnum,
};
