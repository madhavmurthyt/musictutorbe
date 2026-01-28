const { Op } = require('sequelize');
const { User, TutorProfile } = require('../models');
const ApiError = require('../utils/ApiError');

// ============================================
// TUTOR SERVICE
// ============================================

/**
 * List tutors with filtering and pagination
 */
const listTutors = async (query) => {
  const {
    instrument,
    city,
    state,
    minRate,
    maxRate,
    proficiencyLevel,
    isOnline,
    isVerified,
    page = 1,
    limit = 20,
    sortBy = 'rating',
    sortOrder = 'desc',
  } = query;

  // Build where conditions for TutorProfile
  const profileWhere = {
    onboardingComplete: true, // Only show tutors who completed onboarding
  };

  if (instrument) {
    profileWhere.instrument = { [Op.iLike]: `%${instrument}%` };
  }
  if (city) {
    profileWhere.city = { [Op.iLike]: `%${city}%` };
  }
  if (state) {
    profileWhere.state = { [Op.iLike]: `%${state}%` };
  }
  if (proficiencyLevel) {
    profileWhere.proficiencyLevel = proficiencyLevel;
  }
  if (typeof isOnline === 'boolean') {
    profileWhere.isOnline = isOnline;
  }
  if (typeof isVerified === 'boolean') {
    profileWhere.isVerified = isVerified;
  }
  if (minRate || maxRate) {
    profileWhere.hourlyRate = {};
    if (minRate) profileWhere.hourlyRate[Op.gte] = minRate;
    if (maxRate) profileWhere.hourlyRate[Op.lte] = maxRate;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Map sortBy to actual column names
  const sortColumnMap = {
    rating: 'rating',
    hourlyRate: 'hourly_rate',
    yearsOfExperience: 'years_of_experience',
    createdAt: 'created_at',
  };

  const sortColumn = sortColumnMap[sortBy] || 'rating';

  // Find tutors
  const { count, rows } = await TutorProfile.findAndCountAll({
    where: profileWhere,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'photoUrl', 'email'],
        where: { role: 'teacher' },
      },
    ],
    order: [[sortColumn, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  // Transform data for API response
  const tutors = rows.map((profile) => ({
    id: profile.userId, // Use userId as tutor ID
    name: profile.user.name,
    photoUrl: profile.user.photoUrl,
    email: profile.user.email,
    instrument: profile.instrument,
    proficiencyLevel: profile.proficiencyLevel,
    location: {
      city: profile.city,
      state: profile.state,
      country: profile.country,
    },
    hourlyRate: parseFloat(profile.hourlyRate),
    rating: parseFloat(profile.rating) || 0,
    reviewCount: profile.reviewCount,
    bio: profile.bio,
    availability: profile.availability || [],
    isOnline: profile.isOnline,
    isVerified: profile.isVerified,
    yearsOfExperience: profile.yearsOfExperience,
  }));

  return {
    tutors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    },
  };
};

/**
 * Get single tutor by ID (userId)
 */
const getTutorById = async (tutorId) => {
  const profile = await TutorProfile.findOne({
    where: { userId: tutorId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'photoUrl', 'email'],
        where: { role: 'teacher' },
      },
    ],
  });

  if (!profile) {
    throw new ApiError(404, 'Tutor not found', 'TUTOR_NOT_FOUND');
  }

  return {
    id: profile.userId,
    name: profile.user.name,
    photoUrl: profile.user.photoUrl,
    email: profile.user.email,
    instrument: profile.instrument,
    proficiencyLevel: profile.proficiencyLevel,
    location: {
      city: profile.city,
      state: profile.state,
      country: profile.country,
    },
    hourlyRate: parseFloat(profile.hourlyRate),
    rating: parseFloat(profile.rating) || 0,
    reviewCount: profile.reviewCount,
    bio: profile.bio,
    availability: profile.availability || [],
    isOnline: profile.isOnline,
    isVerified: profile.isVerified,
    yearsOfExperience: profile.yearsOfExperience,
  };
};

/**
 * Create or update tutor profile (onboarding)
 */
const createOrUpdateTutorProfile = async (userId, data) => {
  // Find existing profile
  let profile = await TutorProfile.findOne({ where: { userId } });

  if (!profile) {
    // Create new profile
    profile = await TutorProfile.create({
      userId,
      ...data,
      onboardingComplete: true,
    });
  } else {
    // Update existing profile
    await profile.update({
      ...data,
      onboardingComplete: true,
    });
  }

  // Fetch with user data
  const updatedProfile = await TutorProfile.findOne({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'photoUrl', 'email'],
      },
    ],
  });

  // Mock email notification
  console.log(`📧 [Mock Email] Tutor profile updated for ${updatedProfile.user.email}`);

  return {
    id: updatedProfile.userId,
    name: updatedProfile.user.name,
    photoUrl: updatedProfile.user.photoUrl,
    instrument: updatedProfile.instrument,
    proficiencyLevel: updatedProfile.proficiencyLevel,
    location: {
      city: updatedProfile.city,
      state: updatedProfile.state,
      country: updatedProfile.country,
    },
    hourlyRate: parseFloat(updatedProfile.hourlyRate),
    bio: updatedProfile.bio,
    availability: updatedProfile.availability || [],
    isOnline: updatedProfile.isOnline,
    yearsOfExperience: updatedProfile.yearsOfExperience,
    onboardingComplete: updatedProfile.onboardingComplete,
  };
};

/**
 * Update tutor availability only
 */
const updateAvailability = async (userId, availability) => {
  const profile = await TutorProfile.findOne({ where: { userId } });

  if (!profile) {
    throw new ApiError(404, 'Tutor profile not found', 'PROFILE_NOT_FOUND');
  }

  await profile.update({ availability });

  return { availability: profile.availability };
};

/**
 * Update tutor online status
 */
const updateOnlineStatus = async (userId, isOnline) => {
  const profile = await TutorProfile.findOne({ where: { userId } });

  if (!profile) {
    throw new ApiError(404, 'Tutor profile not found', 'PROFILE_NOT_FOUND');
  }

  await profile.update({ isOnline });

  return { isOnline: profile.isOnline };
};

module.exports = {
  listTutors,
  getTutorById,
  createOrUpdateTutorProfile,
  updateAvailability,
  updateOnlineStatus,
};
