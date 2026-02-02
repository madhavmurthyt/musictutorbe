const { Op } = require('sequelize');
const { User, TutorProfile, StudentProfile, Enquiry } = require('../models');
const ApiError = require('../utils/ApiError');

// ============================================
// ENQUIRY SERVICE
// ============================================

/**
 * Create a new enquiry (student sends to tutor)
 */
const createEnquiry = async (studentId, data) => {
  const { tutorId, message, studentLevel, preferredDays, preferredTime } = data;

  // Verify tutor exists and is a teacher
  const tutor = await User.findOne({
    where: { id: tutorId, role: 'teacher' },
    include: [{ model: TutorProfile, as: 'tutorProfile' }],
  });

  if (!tutor) {
    throw new ApiError(404, 'Tutor not found', 'TUTOR_NOT_FOUND');
  }

  // Check if student already has a pending enquiry with this tutor
  const existingEnquiry = await Enquiry.findOne({
    where: {
      studentId,
      tutorId,
      status: 'pending',
    },
  });

  if (existingEnquiry) {
    throw new ApiError(
      409,
      'You already have a pending enquiry with this tutor',
      'DUPLICATE_ENQUIRY'
    );
  }

  // Create enquiry
  const enquiry = await Enquiry.create({
    studentId,
    tutorId,
    message,
    studentLevel,
    preferredDays,
    preferredTime,
    status: 'pending',
  });

  // Fetch with associations
  const createdEnquiry = await Enquiry.findByPk(enquiry.id, {
    include: [
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'name', 'photoUrl', 'email'],
      },
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'photoUrl', 'email'],
      },
    ],
  });

  // Mock email notification
  console.log(`📧 [Mock Email] New enquiry notification sent to ${tutor.email}`);
  console.log(`   From: ${createdEnquiry.student.name}`);
  console.log(`   Message: ${message.substring(0, 50)}...`);

  return {
    id: createdEnquiry.id,
    tutorId: createdEnquiry.tutorId,
    tutorName: createdEnquiry.tutor.name,
    tutorPhotoUrl: createdEnquiry.tutor.photoUrl,
    message: createdEnquiry.message,
    studentLevel: createdEnquiry.studentLevel,
    preferredDays: createdEnquiry.preferredDays,
    preferredTime: createdEnquiry.preferredTime,
    status: createdEnquiry.status,
    createdAt: createdEnquiry.createdAt,
  };
};

/**
 * List enquiries for a student (sent enquiries)
 */
const listStudentEnquiries = async (studentId, query) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const where = { studentId };
  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Enquiry.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'name', 'photoUrl', 'email'],
        include: [
          {
            model: TutorProfile,
            as: 'tutorProfile',
            attributes: ['instrument', 'city', 'state', 'preferredContactMode', 'preferredContactValue'],
          },
        ],
      },
    ],
    order: [[sortBy === 'status' ? 'status' : 'created_at', sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  const enquiries = rows.map((e) => {
    const tutorProfile = e.tutor?.tutorProfile;
    const isAccepted = e.status === 'accepted';
    const tutorContact =
      isAccepted &&
      tutorProfile?.preferredContactMode &&
      tutorProfile?.preferredContactValue
        ? {
            mode: tutorProfile.preferredContactMode,
            value: tutorProfile.preferredContactValue,
          }
        : null;

    return {
      id: e.id,
      tutorId: e.tutorId,
      tutorName: e.tutor.name,
      tutorPhotoUrl: e.tutor.photoUrl,
      tutorInstrument: tutorProfile?.instrument,
      tutorLocation: tutorProfile
        ? { city: tutorProfile.city, state: tutorProfile.state }
        : null,
      tutorContact,
      message: e.message,
      studentLevel: e.studentLevel,
      preferredDays: e.preferredDays,
      preferredTime: e.preferredTime,
      status: e.status,
      createdAt: e.createdAt,
      respondedAt: e.respondedAt,
    };
  });

  return {
    enquiries,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    },
  };
};

/**
 * List enquiries for a teacher (received enquiries)
 */
const listTeacherEnquiries = async (tutorId, query) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const where = { tutorId };
  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Enquiry.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'photoUrl', 'email'],
        include: [
          {
            model: StudentProfile,
            as: 'studentProfile',
            attributes: ['level', 'bio'],
          },
        ],
      },
    ],
    order: [[sortBy === 'status' ? 'status' : 'created_at', sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  const enquiries = rows.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    studentName: e.student.name,
    studentEmail: e.student.email,
    studentPhotoUrl: e.student.photoUrl,
    studentProfileLevel: e.student.studentProfile?.level,
    studentLevel: e.studentLevel,
    message: e.message,
    preferredDays: e.preferredDays,
    preferredTime: e.preferredTime,
    status: e.status,
    createdAt: e.createdAt,
    respondedAt: e.respondedAt,
  }));

  return {
    enquiries,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    },
  };
};

/**
 * Get enquiry by ID
 * For students viewing an accepted enquiry, includes tutorContact (mode + value).
 */
const getEnquiryById = async (enquiryId, userId) => {
  const enquiry = await Enquiry.findByPk(enquiryId, {
    include: [
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'name', 'photoUrl', 'email'],
        include: [
          {
            model: TutorProfile,
            as: 'tutorProfile',
            attributes: ['preferredContactMode', 'preferredContactValue'],
          },
        ],
      },
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'photoUrl', 'email'],
      },
    ],
  });

  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found', 'ENQUIRY_NOT_FOUND');
  }

  if (enquiry.studentId !== userId && enquiry.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }

  const plain = enquiry.toJSON ? enquiry.toJSON() : enquiry.get({ plain: true });

  if (enquiry.studentId === userId && enquiry.status === 'accepted') {
    const tp = enquiry.tutor?.tutorProfile;
    if (tp?.preferredContactMode && tp?.preferredContactValue) {
      plain.tutorContact = {
        mode: tp.preferredContactMode,
        value: tp.preferredContactValue,
      };
    }
  }

  return plain;
};

/**
 * Update enquiry status (teacher accepts/declines)
 */
const updateEnquiryStatus = async (enquiryId, tutorId, status) => {
  const enquiry = await Enquiry.findByPk(enquiryId, {
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found', 'ENQUIRY_NOT_FOUND');
  }

  // Check if this tutor owns the enquiry
  if (enquiry.tutorId !== tutorId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }

  // Check if enquiry is still pending
  if (enquiry.status !== 'pending') {
    throw new ApiError(400, 'This enquiry has already been responded to', 'ALREADY_RESPONDED');
  }

  // Update status
  await enquiry.update({
    status,
    respondedAt: new Date(),
  });

  // Mock email notification to student
  console.log(`📧 [Mock Email] Enquiry ${status} notification sent to ${enquiry.student.email}`);
  console.log(`   Tutor: ${enquiry.tutor.name}`);
  console.log(`   Status: ${status}`);

  return {
    id: enquiry.id,
    status: enquiry.status,
    respondedAt: enquiry.respondedAt,
  };
};

/**
 * Get enquiry statistics for teacher dashboard
 */
const getTeacherEnquiryStats = async (tutorId) => {
  const [pending, accepted, declined, total] = await Promise.all([
    Enquiry.count({ where: { tutorId, status: 'pending' } }),
    Enquiry.count({ where: { tutorId, status: 'accepted' } }),
    Enquiry.count({ where: { tutorId, status: 'declined' } }),
    Enquiry.count({ where: { tutorId } }),
  ]);

  return {
    pending,
    accepted,
    declined,
    total,
  };
};

module.exports = {
  createEnquiry,
  listStudentEnquiries,
  listTeacherEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  getTeacherEnquiryStats,
};
