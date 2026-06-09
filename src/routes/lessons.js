const express = require('express');
const lessonService = require('../services/lesson.service');
const { auth } = require('../middleware/auth');
const { requireStudent, requireTeacher, requireUser } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success, created } = require('../utils/response');
const {
  proposeScheduleSchema,
  respondScheduleSchema,
  listSchedulesQuerySchema,
  listLessonsQuerySchema,
  addNotesSchema,
} = require('../validators/lesson.schema');

const router = express.Router();

router.post(
  '/schedules',
  auth,
  requireStudent,
  validate(proposeScheduleSchema),
  async (req, res, next) => {
    try {
      const schedule = await lessonService.proposeSchedule(req.userId, req.validatedBody);
      return created(res, { schedule }, 'Schedule proposed');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/schedules',
  auth,
  requireUser,
  validate(listSchedulesQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await lessonService.listSchedules(req.userId, req.user.role, req.validatedQuery);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/schedules/:id',
  auth,
  requireTeacher,
  validate(respondScheduleSchema),
  async (req, res, next) => {
    try {
      const schedule = await lessonService.respondToSchedule(
        req.userId,
        req.params.id,
        req.validatedBody.action
      );
      return success(res, 200, { schedule }, `Schedule ${req.validatedBody.action}ed`);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/schedules/:id/pause',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      const schedule = await lessonService.pauseSchedule(req.params.id, req.userId);
      return success(res, 200, { schedule }, 'Schedule paused');
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/schedules/:id/resume',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      const schedule = await lessonService.resumeSchedule(req.params.id, req.userId);
      return success(res, 200, { schedule }, 'Schedule resumed');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/upcoming-count',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      const result = await lessonService.getUpcomingCount(req.userId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/pending-count',
  auth,
  requireTeacher,
  async (req, res, next) => {
    try {
      const result = await lessonService.getPendingProposalCount(req.userId);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  auth,
  requireUser,
  validate(listLessonsQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await lessonService.listLessons(req.userId, req.user.role, req.validatedQuery);
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      const lesson = await lessonService.getLessonById(req.params.id, req.userId);
      return success(res, 200, { lesson });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/cancel',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      const lesson = await lessonService.cancelLesson(req.params.id, req.userId);
      return success(res, 200, { lesson }, 'Lesson cancelled');
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/notes',
  auth,
  requireUser,
  validate(addNotesSchema),
  async (req, res, next) => {
    try {
      const lesson = await lessonService.addLessonNotes(
        req.params.id,
        req.userId,
        req.user.role,
        req.validatedBody.notes
      );
      return success(res, 200, { lesson }, 'Notes saved');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
