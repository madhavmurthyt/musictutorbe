const { Op } = require('sequelize');
const { User, Enquiry, PracticeAssignment, PracticeCompletion } = require('../models');
const ApiError = require('../utils/ApiError');

function localDateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const verifyConnection = async (tutorId, studentId) => {
  const enquiry = await Enquiry.findOne({
    where: { tutorId, studentId, status: 'accepted' },
  });
  if (!enquiry) {
    throw new ApiError(403, 'No accepted connection with this student', 'NOT_CONNECTED');
  }
  return enquiry;
};

const formatAssignment = (a, isCompletedToday = false) => ({
  id: a.id,
  tutorId: a.tutorId,
  studentId: a.studentId,
  description: a.description,
  durationMinutes: a.durationMinutes,
  sortOrder: a.sortOrder,
  isActive: a.isActive,
  isCompletedToday,
  tutorName: a.tutor?.name ?? null,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

const computeStreaks = async (studentId) => {
  const completions = await PracticeCompletion.findAll({
    where: { studentId },
    attributes: ['completedDate'],
    group: ['completedDate'],
    order: [['completedDate', 'DESC']],
    raw: true,
  });

  if (completions.length === 0) return { current: 0, longest: 0 };

  const dates = completions.map((c) => c.completedDate);

  const toMs = (d) => new Date(d + 'T00:00:00').getTime();
  const ONE_DAY = 86400000;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = localDateStr(today);
  const yesterdayStr = localDateStr(new Date(today.getTime() - ONE_DAY));

  let current = 0;
  if (dates[0] === todayStr || dates[0] === yesterdayStr) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = toMs(dates[i - 1]) - toMs(dates[i]);
      if (diff === ONE_DAY) {
        current++;
      } else {
        break;
      }
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = toMs(dates[i - 1]) - toMs(dates[i]);
    if (diff === ONE_DAY) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
};

const createAssignment = async (tutorId, { studentId, description, durationMinutes, sortOrder }) => {
  await verifyConnection(tutorId, studentId);

  const assignment = await PracticeAssignment.create({
    tutorId,
    studentId,
    description,
    durationMinutes: durationMinutes ?? 15,
    sortOrder: sortOrder ?? 0,
  });

  return formatAssignment(assignment);
};

const updateAssignment = async (tutorId, assignmentId, updates) => {
  const assignment = await PracticeAssignment.findByPk(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (assignment.tutorId !== tutorId) throw new ApiError(403, 'Access denied', 'FORBIDDEN');

  const allowed = ['description', 'durationMinutes', 'sortOrder', 'isActive'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      assignment[key] = updates[key];
    }
  }
  await assignment.save();

  return formatAssignment(assignment);
};

const deleteAssignment = async (tutorId, assignmentId) => {
  const assignment = await PracticeAssignment.findByPk(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (assignment.tutorId !== tutorId) throw new ApiError(403, 'Access denied', 'FORBIDDEN');

  await assignment.destroy();
};

const getStudentAssignments = async (studentId, date) => {
  const assignments = await PracticeAssignment.findAll({
    where: { studentId, isActive: true },
    include: [{ model: User, as: 'tutor', attributes: ['id', 'name'] }],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
  });

  const completions = await PracticeCompletion.findAll({
    where: { studentId, completedDate: date },
    attributes: ['assignmentId'],
    raw: true,
  });
  const completedIds = new Set(completions.map((c) => c.assignmentId));

  const streaks = await computeStreaks(studentId);

  return {
    assignments: assignments.map((a) => formatAssignment(a, completedIds.has(a.id))),
    streaks,
  };
};

const toggleCompletion = async (studentId, assignmentId, completedDate) => {
  const assignment = await PracticeAssignment.findByPk(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found', 'ASSIGNMENT_NOT_FOUND');
  if (assignment.studentId !== studentId) throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  if (!assignment.isActive) throw new ApiError(400, 'Assignment is no longer active', 'ASSIGNMENT_INACTIVE');

  const existing = await PracticeCompletion.findOne({
    where: { assignmentId, completedDate },
  });

  if (existing) {
    await existing.destroy();
    return { completed: false };
  }

  await PracticeCompletion.create({
    assignmentId,
    studentId,
    completedDate,
  });
  return { completed: true };
};

const getCompletionHistory = async (studentId, { startDate, endDate } = {}) => {
  const where = { studentId };
  if (startDate || endDate) {
    where.completedDate = {};
    if (startDate) where.completedDate[Op.gte] = startDate;
    if (endDate) where.completedDate[Op.lte] = endDate;
  }

  const completions = await PracticeCompletion.findAll({
    where,
    include: [{ model: PracticeAssignment, as: 'assignment', attributes: ['id', 'description', 'durationMinutes'] }],
    order: [['completedDate', 'DESC'], ['createdAt', 'DESC']],
  });

  const streaks = await computeStreaks(studentId);

  return {
    completions: completions.map((c) => ({
      id: c.id,
      assignmentId: c.assignmentId,
      description: c.assignment?.description ?? '',
      durationMinutes: c.assignment?.durationMinutes ?? 0,
      completedDate: c.completedDate,
    })),
    streaks,
  };
};

const getTeacherStudentOverview = async (tutorId) => {
  const enquiries = await Enquiry.findAll({
    where: { tutorId, status: 'accepted' },
    include: [{ model: User, as: 'student', attributes: ['id', 'name', 'photoUrl'] }],
  });

  const today = localDateStr();
  const students = [];

  for (const enq of enquiries) {
    const student = enq.student;
    if (!student) continue;

    const activeAssignments = await PracticeAssignment.count({
      where: { tutorId, studentId: student.id, isActive: true },
    });

    const completedToday = await PracticeCompletion.count({
      where: { studentId: student.id, completedDate: today },
      include: [{
        model: PracticeAssignment,
        as: 'assignment',
        where: { tutorId, isActive: true },
        attributes: [],
      }],
    });

    const streaks = await computeStreaks(student.id);

    students.push({
      studentId: student.id,
      studentName: student.name,
      studentPhotoUrl: student.photoUrl,
      assignmentCount: activeAssignments,
      completedToday,
      totalToday: activeAssignments,
      currentStreak: streaks.current,
    });
  }

  return { students };
};

const getTeacherStudentDetail = async (tutorId, studentId) => {
  await verifyConnection(tutorId, studentId);

  const assignments = await PracticeAssignment.findAll({
    where: { tutorId, studentId },
    order: [['isActive', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'ASC']],
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 6 * 86400000);
  const startDate = localDateStr(sevenDaysAgo);
  const endDate = localDateStr(now);

  const completions = await PracticeCompletion.findAll({
    where: {
      studentId,
      completedDate: { [Op.between]: [startDate, endDate] },
    },
    include: [{
      model: PracticeAssignment,
      as: 'assignment',
      where: { tutorId },
      attributes: [],
    }],
    attributes: ['assignmentId', 'completedDate'],
  });

  const completionMap = {};
  for (const c of completions) {
    const aId = c.assignmentId;
    const date = c.completedDate;
    if (!completionMap[aId]) completionMap[aId] = [];
    completionMap[aId].push(date);
  }

  const streaks = await computeStreaks(studentId);

  const student = await User.findByPk(studentId, { attributes: ['id', 'name', 'photoUrl'] });

  return {
    student: {
      id: student.id,
      name: student.name,
      photoUrl: student.photoUrl,
    },
    assignments: assignments.map((a) => ({
      id: a.id,
      description: a.description,
      durationMinutes: a.durationMinutes,
      sortOrder: a.sortOrder,
      isActive: a.isActive,
      completedDates: completionMap[a.id] || [],
      createdAt: a.createdAt,
    })),
    streaks,
    dateRange: { startDate, endDate },
  };
};

const getPendingCount = async (studentId) => {
  const today = localDateStr();

  const activeCount = await PracticeAssignment.count({
    where: { studentId, isActive: true },
  });

  const completedCount = await PracticeCompletion.count({
    where: { studentId, completedDate: today },
    include: [{
      model: PracticeAssignment,
      as: 'assignment',
      where: { studentId, isActive: true },
      attributes: [],
    }],
  });

  return { count: Math.max(0, activeCount - completedCount) };
};

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getStudentAssignments,
  toggleCompletion,
  getCompletionHistory,
  getTeacherStudentOverview,
  getTeacherStudentDetail,
  getPendingCount,
};
