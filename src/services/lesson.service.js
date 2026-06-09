const { Op } = require('sequelize');
const { User, TutorProfile, Enquiry, LessonSchedule, Lesson } = require('../models');
const ApiError = require('../utils/ApiError');
const pushService = require('./push.service');

const DAY_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function getNextDatesForDay(dayOfWeek, weeksAhead = 4) {
  const targetDay = DAY_MAP[dayOfWeek];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [];
  const current = new Date(today);
  const daysUntil = (targetDay - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + (daysUntil === 0 ? 7 : daysUntil));

  for (let i = 0; i < weeksAhead; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const proposeSchedule = async (studentId, { enquiryId, dayOfWeek, startTime, durationMinutes }) => {
  const enquiry = await Enquiry.findByPk(enquiryId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
  });

  if (!enquiry) throw new ApiError(404, 'Enquiry not found', 'ENQUIRY_NOT_FOUND');
  if (enquiry.studentId !== studentId) throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  if (enquiry.status !== 'accepted') {
    throw new ApiError(400, 'Enquiry must be accepted before booking lessons', 'ENQUIRY_NOT_ACCEPTED');
  }

  const tutorProfile = await TutorProfile.findOne({ where: { userId: enquiry.tutorId } });
  const availability = tutorProfile?.availability || [];
  const daySlot = availability.find((s) => s.day === dayOfWeek);
  if (!daySlot) {
    throw new ApiError(400, 'Teacher is not available on this day', 'DAY_NOT_AVAILABLE');
  }

  const requestStart = timeToMinutes(startTime);
  const requestEnd = requestStart + durationMinutes;
  const slotStart = timeToMinutes(daySlot.startTime);
  const slotEnd = timeToMinutes(daySlot.endTime);

  if (requestStart < slotStart || requestEnd > slotEnd) {
    throw new ApiError(400, 'Requested time does not fit within teacher availability', 'TIME_NOT_AVAILABLE');
  }

  // Check for overlapping schedules with this tutor (from any student)
  const tutorSchedules = await LessonSchedule.findAll({
    where: {
      tutorId: enquiry.tutorId,
      dayOfWeek,
      status: { [Op.in]: ['proposed', 'active'] },
    },
  });

  for (const s of tutorSchedules) {
    const existStart = timeToMinutes(s.startTime);
    const existEnd = existStart + s.durationMinutes;
    if (requestStart < existEnd && requestEnd > existStart) {
      throw new ApiError(
        409,
        'This time slot overlaps with an existing lesson for this teacher',
        'TIME_CONFLICT'
      );
    }
  }

  const schedule = await LessonSchedule.create({
    enquiryId,
    studentId,
    tutorId: enquiry.tutorId,
    dayOfWeek,
    startTime,
    durationMinutes,
    status: 'proposed',
    proposedBy: studentId,
  });

  pushService.sendPushNotification(enquiry.tutorId, {
    title: 'New Lesson Proposal',
    body: `${enquiry.student.name} wants weekly lessons on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} at ${startTime}`,
    data: { type: 'lesson_proposed', scheduleId: schedule.id },
  });

  return formatSchedule({
    ...schedule.toJSON(),
    student: enquiry.student,
    tutor: enquiry.tutor,
  });
};

const respondToSchedule = async (tutorId, scheduleId, action) => {
  const schedule = await LessonSchedule.findByPk(scheduleId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
  });

  if (!schedule) throw new ApiError(404, 'Schedule not found', 'SCHEDULE_NOT_FOUND');
  if (schedule.tutorId !== tutorId) throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  if (schedule.status !== 'proposed') {
    throw new ApiError(400, 'Schedule has already been responded to', 'ALREADY_RESPONDED');
  }

  if (action === 'accept') {
    await schedule.update({ status: 'active', respondedAt: new Date() });
    await generateLessonInstances(schedule, 4);

    pushService.sendPushNotification(schedule.studentId, {
      title: 'Lessons Confirmed!',
      body: `${schedule.tutor.name} accepted your lesson schedule`,
      data: { type: 'lesson_accepted', scheduleId: schedule.id },
    });
  } else {
    await schedule.update({ status: 'cancelled', respondedAt: new Date() });

    pushService.sendPushNotification(schedule.studentId, {
      title: 'Lesson Proposal Declined',
      body: `${schedule.tutor.name} declined your lesson proposal`,
      data: { type: 'lesson_declined', scheduleId: schedule.id },
    });
  }

  return formatSchedule(schedule);
};

const generateLessonInstances = async (schedule, weeksAhead = 4) => {
  const dates = getNextDatesForDay(schedule.dayOfWeek, weeksAhead);
  const lessons = [];

  for (const date of dates) {
    const dateStr = date.toISOString().split('T')[0];
    try {
      const lesson = await Lesson.create({
        scheduleId: schedule.id,
        studentId: schedule.studentId,
        tutorId: schedule.tutorId,
        scheduledDate: dateStr,
        startTime: schedule.startTime,
        durationMinutes: schedule.durationMinutes,
        status: 'upcoming',
      });
      lessons.push(lesson);
    } catch (err) {
      // Unique constraint violation — lesson already exists for this date
      if (err.name === 'SequelizeUniqueConstraintError') continue;
      throw err;
    }
  }

  return lessons;
};

const listSchedules = async (userId, role, { status, page = 1, limit = 20 }) => {
  const where = role === 'student' ? { studentId: userId } : { tutorId: userId };
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { count, rows } = await LessonSchedule.findAndCountAll({
    where,
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    schedules: rows.map(formatSchedule),
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
};

const listLessons = async (userId, role, { upcoming = true, page = 1, limit = 20 }) => {
  const where = role === 'student' ? { studentId: userId } : { tutorId: userId };

  if (upcoming) {
    where.status = 'upcoming';
    where.scheduledDate = { [Op.gte]: new Date().toISOString().split('T')[0] };
  } else {
    where.status = { [Op.in]: ['completed', 'cancelled'] };
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Lesson.findAndCountAll({
    where,
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
      {
        model: LessonSchedule,
        as: 'schedule',
        attributes: ['dayOfWeek', 'startTime', 'durationMinutes'],
      },
    ],
    order: [['scheduled_date', upcoming ? 'ASC' : 'DESC'], ['start_time', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    lessons: rows.map(formatLesson),
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
  };
};

const getLessonById = async (lessonId, userId) => {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
      {
        model: LessonSchedule,
        as: 'schedule',
        attributes: ['id', 'dayOfWeek', 'startTime', 'durationMinutes', 'status'],
      },
    ],
  });

  if (!lesson) throw new ApiError(404, 'Lesson not found', 'LESSON_NOT_FOUND');
  if (lesson.studentId !== userId && lesson.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }

  return formatLesson(lesson);
};

const cancelLesson = async (lessonId, userId) => {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
  });

  if (!lesson) throw new ApiError(404, 'Lesson not found', 'LESSON_NOT_FOUND');
  if (lesson.studentId !== userId && lesson.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }
  if (lesson.status !== 'upcoming') {
    throw new ApiError(400, 'Only upcoming lessons can be cancelled', 'CANNOT_CANCEL');
  }

  await lesson.update({ status: 'cancelled', cancelledBy: userId });

  const recipientId = lesson.studentId === userId ? lesson.tutorId : lesson.studentId;
  const canceller = lesson.studentId === userId ? lesson.student : lesson.tutor;

  pushService.sendPushNotification(recipientId, {
    title: 'Lesson Cancelled',
    body: `${canceller.name} cancelled the lesson on ${lesson.scheduledDate}`,
    data: { type: 'lesson_cancelled', lessonId: lesson.id },
  });

  return formatLesson(lesson);
};

const addLessonNotes = async (lessonId, userId, role, notes) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) throw new ApiError(404, 'Lesson not found', 'LESSON_NOT_FOUND');
  if (lesson.studentId !== userId && lesson.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }
  if (lesson.status !== 'completed') {
    throw new ApiError(400, 'Notes can only be added to completed lessons', 'NOT_COMPLETED');
  }

  if (role === 'teacher') {
    await lesson.update({ teacherNotes: notes });
  } else {
    await lesson.update({ studentNotes: notes });
  }

  return formatLesson(lesson);
};

const pauseSchedule = async (scheduleId, userId) => {
  const schedule = await LessonSchedule.findByPk(scheduleId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
  });

  if (!schedule) throw new ApiError(404, 'Schedule not found', 'SCHEDULE_NOT_FOUND');
  if (schedule.studentId !== userId && schedule.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }
  if (schedule.status !== 'active') {
    throw new ApiError(400, 'Only active schedules can be paused', 'CANNOT_PAUSE');
  }

  await schedule.update({ status: 'paused' });

  await Lesson.update(
    { status: 'cancelled', cancelledBy: userId },
    {
      where: {
        scheduleId,
        status: 'upcoming',
        scheduledDate: { [Op.gte]: new Date().toISOString().split('T')[0] },
      },
    }
  );

  return formatSchedule(schedule);
};

const resumeSchedule = async (scheduleId, userId) => {
  const schedule = await LessonSchedule.findByPk(scheduleId, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'photoUrl'] },
    ],
  });

  if (!schedule) throw new ApiError(404, 'Schedule not found', 'SCHEDULE_NOT_FOUND');
  if (schedule.studentId !== userId && schedule.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }
  if (schedule.status !== 'paused') {
    throw new ApiError(400, 'Only paused schedules can be resumed', 'CANNOT_RESUME');
  }

  await schedule.update({ status: 'active' });
  await generateLessonInstances(schedule, 4);

  return formatSchedule(schedule);
};

const getUpcomingCount = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const count = await Lesson.count({
    where: {
      [Op.or]: [{ studentId: userId }, { tutorId: userId }],
      status: 'upcoming',
      scheduledDate: { [Op.gte]: today },
    },
  });
  return { count };
};

function formatSchedule(s) {
  const plain = s.toJSON ? s.toJSON() : s;
  return {
    id: plain.id,
    enquiryId: plain.enquiryId,
    studentId: plain.studentId,
    tutorId: plain.tutorId,
    dayOfWeek: plain.dayOfWeek,
    startTime: plain.startTime,
    durationMinutes: plain.durationMinutes,
    status: plain.status,
    proposedBy: plain.proposedBy,
    respondedAt: plain.respondedAt,
    studentName: plain.student?.name || null,
    studentPhotoUrl: plain.student?.photoUrl || null,
    tutorName: plain.tutor?.name || null,
    tutorPhotoUrl: plain.tutor?.photoUrl || null,
    createdAt: plain.createdAt,
  };
}

function formatLesson(l) {
  const plain = l.toJSON ? l.toJSON() : l;
  return {
    id: plain.id,
    scheduleId: plain.scheduleId,
    studentId: plain.studentId,
    tutorId: plain.tutorId,
    scheduledDate: plain.scheduledDate,
    startTime: plain.startTime,
    durationMinutes: plain.durationMinutes,
    status: plain.status,
    teacherNotes: plain.teacherNotes || null,
    studentNotes: plain.studentNotes || null,
    cancelledBy: plain.cancelledBy || null,
    studentName: plain.student?.name || null,
    studentPhotoUrl: plain.student?.photoUrl || null,
    tutorName: plain.tutor?.name || null,
    tutorPhotoUrl: plain.tutor?.photoUrl || null,
    schedule: plain.schedule
      ? {
          dayOfWeek: plain.schedule.dayOfWeek,
          startTime: plain.schedule.startTime,
          durationMinutes: plain.schedule.durationMinutes,
          status: plain.schedule.status,
        }
      : null,
    createdAt: plain.createdAt,
  };
}

const getPendingProposalCount = async (tutorId) => {
  const count = await LessonSchedule.count({
    where: { tutorId, status: 'proposed' },
  });
  return { count };
};

module.exports = {
  proposeSchedule,
  respondToSchedule,
  generateLessonInstances,
  listSchedules,
  listLessons,
  getLessonById,
  cancelLesson,
  addLessonNotes,
  pauseSchedule,
  resumeSchedule,
  getUpcomingCount,
  getPendingProposalCount,
};
