const { z } = require('zod');

const createAssignmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  durationMinutes: z.coerce.number().int().min(5).max(120).default(15),
  sortOrder: z.coerce.number().int().min(0).default(0).optional(),
});

const updateAssignmentSchema = z.object({
  description: z.string().min(1).max(500).trim().optional(),
  durationMinutes: z.coerce.number().int().min(5).max(120).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const toggleCompletionSchema = z.object({
  completedDate: z
    .string({ required_error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

const completionHistoryQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentSchema,
  toggleCompletionSchema,
  completionHistoryQuerySchema,
};
