const express = require('express');
const practiceService = require('../services/practice.service');
const { auth } = require('../middleware/auth');
const { requireStudent, requireTeacher } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success, created, noContent } = require('../utils/response');
const {
  createAssignmentSchema,
  updateAssignmentSchema,
  toggleCompletionSchema,
  completionHistoryQuerySchema,
} = require('../validators/practice.schema');

const router = express.Router();

// ============================================
// TEACHER ROUTES
// ============================================

router.post(
  '/',
  auth,
  requireTeacher,
  validate(createAssignmentSchema),
  async (req, res, next) => {
    try {
      const assignment = await practiceService.createAssignment(req.userId, req.validatedBody);
      return created(res, { assignment }, 'Assignment created');
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  auth,
  requireTeacher,
  validate(updateAssignmentSchema),
  async (req, res, next) => {
    try {
      const assignment = await practiceService.updateAssignment(req.userId, req.params.id, req.validatedBody);
      return success(res, 200, { assignment }, 'Assignment updated');
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  auth,
  requireTeacher,
  async (req, res, next) => {
    try {
      await practiceService.deleteAssignment(req.userId, req.params.id);
      return noContent(res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/eligibility',
  auth,
  requireTeacher,
  async (req, res, next) => {
    try {
      const result = await practiceService.checkEligibility(req.userId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/students',
  auth,
  requireTeacher,
  async (req, res, next) => {
    try {
      const result = await practiceService.getTeacherStudentOverview(req.userId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/students/:studentId',
  auth,
  requireTeacher,
  async (req, res, next) => {
    try {
      const result = await practiceService.getTeacherStudentDetail(req.userId, req.params.studentId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// STUDENT ROUTES
// ============================================

router.get(
  '/my',
  auth,
  requireStudent,
  async (req, res, next) => {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const result = await practiceService.getStudentAssignments(req.userId, today);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/toggle',
  auth,
  requireStudent,
  validate(toggleCompletionSchema),
  async (req, res, next) => {
    try {
      const result = await practiceService.toggleCompletion(
        req.userId,
        req.params.id,
        req.validatedBody.completedDate
      );
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/my/pending-count',
  auth,
  requireStudent,
  async (req, res, next) => {
    try {
      const result = await practiceService.getPendingCount(req.userId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/my/history',
  auth,
  requireStudent,
  validate(completionHistoryQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await practiceService.getCompletionHistory(req.userId, req.validatedQuery);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
