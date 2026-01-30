const express = require('express');
const studentService = require('../services/student.service');
const { auth } = require('../middleware/auth');
const { requireStudent } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success } = require('../utils/response');
const { updateStudentProfileSchema } = require('../validators/student.schema');

// ============================================
// STUDENT ROUTES
// ============================================

const router = express.Router();

/**
 * GET /api/students/profile
 * Get current student's profile
 * Protected: Student only
 */
router.get('/profile', auth, requireStudent, async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.userId);
    return success(res, 200, { profile });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/students/profile
 * Update student profile (level, bio, preferredInstruments only)
 * Protected: Student only
 */
router.patch(
  '/profile',
  auth,
  requireStudent,
  validate(updateStudentProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await studentService.updateStudentProfile(
        req.userId,
        req.validatedBody
      );
      return success(res, 200, { profile }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
