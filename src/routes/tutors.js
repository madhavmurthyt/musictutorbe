const express = require('express');
const tutorService = require('../services/tutor.service');
const reviewService = require('../services/review.service');
const { auth } = require('../middleware/auth');
const { requireTeacher, requireStudent } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success, created, paginatedWithKey } = require('../utils/response');
const {
  createTutorSchema,
  updateTutorSchema,
  updateAvailabilitySchema,
  listTutorsQuerySchema,
} = require('../validators/tutor.schema');
const {
  submitReviewBodySchema,
  listReviewsQuerySchema,
} = require('../validators/review.schema');

// ============================================
// TUTOR ROUTES
// ============================================

const router = express.Router();

/**
 * GET /api/tutors
 * List all tutors with filtering and pagination
 * Public endpoint
 */
router.get('/', validate(listTutorsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const result = await tutorService.listTutors(req.validatedQuery);
    return paginatedWithKey(res, 'tutors', result.tutors, result.pagination);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tutors/:id/reviews
 * List reviews for a tutor (public)
 */
router.get(
  '/:id/reviews',
  validate(listReviewsQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const { id: tutorId } = req.params;
      const result = await reviewService.listReviewsForTutor(tutorId, req.validatedQuery);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/tutors/:id/reviews
 * Submit or update a review (student only; studentId from auth)
 */
router.post(
  '/:id/reviews',
  auth,
  requireStudent,
  validate(submitReviewBodySchema),
  async (req, res, next) => {
    try {
      const tutorId = req.params.id;
      const studentId = req.userId;
      const { rating, reviewText } = req.validatedBody;
      const review = await reviewService.submitReview(
        tutorId,
        studentId,
        rating,
        reviewText ?? ''
      );
      return created(res, { review }, 'Review submitted');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tutors/:id
 * Get a single tutor by ID
 * Public endpoint
 */
router.get('/:id', async (req, res, next) => {
  try {
    const tutor = await tutorService.getTutorById(req.params.id);
    return success(res, 200, tutor);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutors
 * Create or update tutor profile (onboarding)
 * Protected: Teacher only
 */
router.post(
  '/',
  auth,
  requireTeacher,
  validate(createTutorSchema),
  async (req, res, next) => {
    try {
      const result = await tutorService.createOrUpdateTutorProfile(
        req.userId,
        req.validatedBody
      );
      return created(res, { tutorProfile: result }, 'Tutor profile saved successfully');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/tutors
 * Update tutor profile (partial update)
 * Protected: Teacher only
 */
router.patch(
  '/',
  auth,
  requireTeacher,
  validate(updateTutorSchema),
  async (req, res, next) => {
    try {
      const result = await tutorService.createOrUpdateTutorProfile(
        req.userId,
        req.validatedBody
      );
      return success(res, 200, { tutorProfile: result }, 'Tutor profile updated');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/tutors/availability
 * Update availability only
 * Protected: Teacher only
 */
router.patch(
  '/availability',
  auth,
  requireTeacher,
  validate(updateAvailabilitySchema),
  async (req, res, next) => {
    try {
      const result = await tutorService.updateAvailability(
        req.userId,
        req.validatedBody.availability
      );
      return success(res, 200, result, 'Availability updated');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/tutors/online-status
 * Update online status
 * Protected: Teacher only
 */
router.patch('/online-status', auth, requireTeacher, async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'isOnline must be a boolean' },
      });
    }
    const result = await tutorService.updateOnlineStatus(req.userId, isOnline);
    return success(res, 200, result, `You are now ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
