const { User, StudentProfile } = require('../models');
const ApiError = require('../utils/ApiError');

// ============================================
// STUDENT SERVICE
// ============================================

/**
 * Get student profile by user ID
 */
const getStudentProfile = async (userId) => {
  const profile = await StudentProfile.findOne({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'photoUrl'],
        where: { role: 'student' },
      },
    ],
  });

  if (!profile) {
    throw new ApiError(404, 'Student profile not found', 'PROFILE_NOT_FOUND');
  }

  return {
    id: profile.userId,
    name: profile.user.name,
    email: profile.user.email,
    photoUrl: profile.user.photoUrl,
    level: profile.level,
    preferredInstruments: profile.preferredInstruments || [],
    bio: profile.bio,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

/**
 * Update student profile
 */
const updateStudentProfile = async (userId, data) => {
  const { level, preferredInstruments, bio } = data;

  // Find existing profile
  let profile = await StudentProfile.findOne({ where: { userId } });

  if (!profile) {
    // Create profile if it doesn't exist (edge case)
    profile = await StudentProfile.create({
      userId,
      level,
      preferredInstruments,
      bio,
    });
  } else {
    // Update existing profile
    await profile.update({
      ...(level !== undefined && { level }),
      ...(preferredInstruments !== undefined && { preferredInstruments }),
      ...(bio !== undefined && { bio }),
    });
  }

  // Fetch updated profile with user data
  const updatedProfile = await StudentProfile.findOne({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'photoUrl'],
      },
    ],
  });

  console.log(`📧 [Mock Email] Student profile updated for ${updatedProfile.user.email}`);

  return {
    id: updatedProfile.userId,
    name: updatedProfile.user.name,
    email: updatedProfile.user.email,
    photoUrl: updatedProfile.user.photoUrl,
    level: updatedProfile.level,
    preferredInstruments: updatedProfile.preferredInstruments || [],
    bio: updatedProfile.bio,
    createdAt: updatedProfile.createdAt,
    updatedAt: updatedProfile.updatedAt,
  };
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
};
