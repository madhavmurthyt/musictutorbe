const express = require('express');
const enquiryService = require('../services/enquiry.service');
const { auth } = require('../middleware/auth');
const { requireStudent, requireTeacher, requireUser } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success, created, paginated } = require('../utils/response');
const {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  listEnquiriesQuerySchema,
} = require('../validators/enquiry.schema');

// ============================================
// ENQUIRY ROUTES
// ============================================

const router = express.Router();

/**
 * POST /api/enquiries
 * Create a new enquiry (student sends to tutor)
 * Protected: Student only
 */
router.post(
  '/',
  auth,
  requireStudent,
  validate(createEnquirySchema),
  async (req, res, next) => {
    try {
      const result = await enquiryService.createEnquiry(req.userId, req.validatedBody);
      return created(res, { enquiry: result }, 'Enquiry sent successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/enquiries
 * List enquiries
 * - Students see their sent enquiries
 * - Teachers see their received enquiries
 * Protected: Student or Teacher
 */
router.get(
  '/',
  auth,
  requireUser,
  validate(listEnquiriesQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      let result;

      if (req.user.role === 'student') {
        result = await enquiryService.listStudentEnquiries(req.userId, req.validatedQuery);
      } else if (req.user.role === 'teacher') {
        result = await enquiryService.listTeacherEnquiries(req.userId, req.validatedQuery);
      }

      return paginated(res, { enquiries: result.enquiries }, result.pagination);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/enquiries/stats
 * Get enquiry statistics for teacher dashboard
 * Protected: Teacher only
 */
router.get('/stats', auth, requireTeacher, async (req, res, next) => {
  try {
    const stats = await enquiryService.getTeacherEnquiryStats(req.userId);
    return success(res, 200, { stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enquiries/:id
 * Get a single enquiry by ID
 * Protected: Owner only (student or tutor of the enquiry)
 */
router.get('/:id', auth, requireUser, async (req, res, next) => {
  try {
    const enquiry = await enquiryService.getEnquiryById(req.params.id, req.userId);
    return success(res, 200, { enquiry });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/enquiries/:id
 * Update enquiry status (accept/decline)
 * Protected: Teacher only (owner of the enquiry)
 */
router.patch(
  '/:id',
  auth,
  requireTeacher,
  validate(updateEnquiryStatusSchema),
  async (req, res, next) => {
    try {
      const result = await enquiryService.updateEnquiryStatus(
        req.params.id,
        req.userId,
        req.validatedBody.status
      );

      const message =
        req.validatedBody.status === 'accepted'
          ? 'Enquiry accepted successfully'
          : 'Enquiry declined';

      return success(res, 200, { enquiry: result }, message);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
