const { z } = require('zod');

// ============================================
// STUDENT VALIDATION SCHEMAS (Zod)
// ============================================

// Update student profile
const updateStudentProfileSchema = z.object({
  level: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'], {
      invalid_type_error: 'Level must be beginner, intermediate, advanced, or expert',
    })
    .optional(),
  preferredInstruments: z
    .array(z.string().min(1, 'Instrument name cannot be empty'))
    .max(10, 'Maximum 10 instruments allowed')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
});

module.exports = {
  updateStudentProfileSchema,
};
