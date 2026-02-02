const { z } = require('zod');

// ============================================
// TUTOR VALIDATION SCHEMAS (Zod)
// ============================================

// Allowed IANA time zones (Americas + Europe). New zones can be added to DB directly; this list is for API validation.
const ALLOWED_TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Vienna',
  'Europe/Athens',
  'Europe/Moscow',
  'UTC',
];

// Time zone slot: time zone + start/end time (e.g. "8am–9am EST")
const timeZoneSlotSchema = z.object({
  timeZone: z
    .string()
    .min(1, 'Time zone is required')
    .refine((tz) => ALLOWED_TIME_ZONES.includes(tz), {
      message: `Time zone must be one of: ${ALLOWED_TIME_ZONES.join(', ')}`,
    }),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
  endTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
});

// Preferred contact: mode (email | phone) + value (email address or phone number)
const preferredContactModeEnum = z.enum(['email', 'phone'], {
  invalid_type_error: 'Preferred contact must be email or phone',
});

// Availability slot schema (day + time range)
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
const proficiencyLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'master'], {
  invalid_type_error: 'Proficiency level must be beginner, intermediate, advanced, expert, or master',
});

// Base tutor profile object (no refine) — .partial() only works on ZodObject
const tutorProfileObjectSchema = z.object({
  instrument: z
    .string()
    .min(1, 'Instrument is required')
    .max(100, 'Instrument must be less than 100 characters'),
  proficiencyLevel: proficiencyLevelEnum.optional(),
  hourlyRate: z
    .number()
    .positive('Hourly rate must be positive')
    .max(1000, 'Hourly rate must be less than 1000')
    .optional(),
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .trim()
    .optional(),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .trim()
    .optional(),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .trim()
    .optional(),
  bio: z
    .string()
    .min(1, 'Bio is required')
    .max(2000, 'Bio must be less than 2000 characters')
    .trim()
    .optional(),
  availability: z.array(availabilitySlotSchema).optional().default([]),
  timeZoneAvailability: z.array(timeZoneSlotSchema).optional().default([]),
  preferredContactMode: preferredContactModeEnum.optional().nullable(),
  preferredContactValue: z.string().max(255).trim().optional().nullable(),
  isOnline: z.boolean().optional().default(false),
  yearsOfExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(100, 'Years of experience must be less than 100')
    .optional()
    .default(0),
});

// Create tutor profile (onboarding) — with preferred contact validation
const createTutorSchema = tutorProfileObjectSchema.refine(
  (data) => {
    if (!data.preferredContactMode) return true;
    if (!data.preferredContactValue) return false;
    if (data.preferredContactMode === 'email') {
      return z.string().email().safeParse(data.preferredContactValue).success;
    }
    return /^[\d\s+\-()]{7,30}$/.test(data.preferredContactValue);
  },
  {
    message:
      'When preferred contact is set, provide a valid email or phone number',
    path: ['preferredContactValue'],
  }
);

// Update tutor profile (partial update) — .partial() on the object schema
const updateTutorSchema = tutorProfileObjectSchema.partial();

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
  timeZoneSlotSchema,
  proficiencyLevelEnum,
  ALLOWED_TIME_ZONES,
};
