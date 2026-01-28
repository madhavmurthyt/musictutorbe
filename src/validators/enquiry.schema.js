const { z } = require('zod');

// ============================================
// ENQUIRY VALIDATION SCHEMAS (Zod)
// ============================================

// Days of week enum
const dayOfWeekEnum = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

// Time preference enum
const timePreferenceEnum = z.enum(['morning', 'afternoon', 'evening', 'flexible']);

// Proficiency level enum
const proficiencyLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

// Enquiry status enum
const enquiryStatusEnum = z.enum(['pending', 'accepted', 'declined']);

// Create enquiry (student sends to tutor)
const createEnquirySchema = z.object({
  tutorId: z
    .string({ required_error: 'Tutor ID is required' })
    .uuid('Invalid tutor ID format'),
  message: z
    .string({ required_error: 'Message is required' })
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),
  studentLevel: proficiencyLevelEnum,
  preferredDays: z
    .array(dayOfWeekEnum)
    .min(1, 'At least one preferred day is required')
    .max(7, 'Cannot select more than 7 days'),
  preferredTime: timePreferenceEnum,
});

// Update enquiry status (teacher accepts/declines)
const updateEnquiryStatusSchema = z.object({
  status: z.enum(['accepted', 'declined'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be accepted or declined',
  }),
});

// Query params for listing enquiries
const listEnquiriesQuerySchema = z.object({
  status: enquiryStatusEnum.optional(),
  sortBy: z.enum(['createdAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// Params validation for enquiry ID
const enquiryIdParamSchema = z.object({
  id: z.string().uuid('Invalid enquiry ID format'),
});

module.exports = {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  listEnquiriesQuerySchema,
  enquiryIdParamSchema,
  dayOfWeekEnum,
  timePreferenceEnum,
  proficiencyLevelEnum,
  enquiryStatusEnum,
};
