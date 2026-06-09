const { z } = require('zod');

const proposeScheduleSchema = z.object({
  enquiryId: z.string().uuid('Invalid enquiry ID'),
  dayOfWeek: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:mm format'),
  durationMinutes: z.coerce
    .number()
    .int()
    .refine((v) => [30, 60, 90].includes(v), 'Duration must be 30, 60, or 90 minutes'),
});

const respondScheduleSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

const listSchedulesQuerySchema = z.object({
  status: z.enum(['proposed', 'active', 'paused', 'cancelled']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const listLessonsQuerySchema = z.object({
  upcoming: z.coerce.boolean().optional().default(true),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const addNotesSchema = z.object({
  notes: z
    .string({ required_error: 'Notes content is required' })
    .min(1, 'Notes cannot be empty')
    .max(2000, 'Notes must be less than 2000 characters')
    .trim(),
});

module.exports = {
  proposeScheduleSchema,
  respondScheduleSchema,
  listSchedulesQuerySchema,
  listLessonsQuerySchema,
  addNotesSchema,
};
