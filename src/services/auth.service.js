const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentProfile, TutorProfile } = require('../models');
const ApiError = require('../utils/ApiError');

// ============================================
// AUTH SERVICE
// ============================================

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash a password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user with email/password
 */
const register = async ({ email, password, name }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    name,
    authProvider: 'email',
  });

  // Generate token
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
};

/**
 * Login with email/password
 */
const login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Check if user has a password (might be OAuth only)
  if (!user.passwordHash) {
    throw new ApiError(
      401,
      'This account uses social login. Please sign in with Google, Apple, or Facebook.',
      'SOCIAL_LOGIN_REQUIRED'
    );
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
};

/**
 * OAuth login (Google/Apple/Facebook)
 * For MVP, this mocks the OAuth flow
 */
const oauthLogin = async ({ provider, idToken, email, name, photoUrl }) => {
  // In production, verify the idToken with the provider
  // For MVP, we'll trust the token and use provided user info

  // Mock: generate a provider ID from the token
  const authProviderId = `${provider}-${Buffer.from(idToken).toString('base64').slice(0, 20)}`;

  // Check if user exists with this provider ID
  let user = await User.findOne({
    where: {
      authProvider: provider,
      authProviderId,
    },
  });

  let isNewUser = false;

  if (!user && email) {
    // Check if user exists with this email
    user = await User.findOne({ where: { email } });

    if (user) {
      // Link OAuth to existing account
      user.authProvider = provider;
      user.authProviderId = authProviderId;
      if (photoUrl) user.photoUrl = photoUrl;
      await user.save();
    }
  }

  if (!user) {
    // Create new user
    user = await User.create({
      email: email || `${authProviderId}@${provider}.oauth`,
      name: name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      photoUrl,
      authProvider: provider,
      authProviderId,
    });
    isNewUser = true;
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
    isNewUser,
  };
};

/**
 * Get current user with profile
 */
const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: StudentProfile,
        as: 'studentProfile',
      },
      {
        model: TutorProfile,
        as: 'tutorProfile',
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Determine which profile to return
  let profile = null;
  let hasCompletedOnboarding = true;

  if (user.role === 'student') {
    profile = user.studentProfile;
  } else if (user.role === 'teacher') {
    profile = user.tutorProfile;
    hasCompletedOnboarding = user.tutorProfile?.onboardingComplete ?? false;
  }

  return {
    user: user.toSafeObject(),
    profile,
    hasCompletedOnboarding,
  };
};

/**
 * Set user role (student or teacher)
 */
const setRole = async (userId, role) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Update role
  user.role = role;
  await user.save();

  // Create corresponding profile if it doesn't exist
  if (role === 'student') {
    const existingProfile = await StudentProfile.findOne({ where: { userId } });
    if (!existingProfile) {
      await StudentProfile.create({ userId });
    }
  } else if (role === 'teacher') {
    const existingProfile = await TutorProfile.findOne({ where: { userId } });
    if (!existingProfile) {
      await TutorProfile.create({ userId });
    }
  }

  // Generate new token with updated role
  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
};

/**
 * Update user profile (name, photoUrl)
 */
const updateProfile = async (userId, { name, photoUrl }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  if (name !== undefined) user.name = name;
  if (photoUrl !== undefined) user.photoUrl = photoUrl;

  await user.save();

  return { user: user.toSafeObject() };
};

module.exports = {
  register,
  login,
  oauthLogin,
  getCurrentUser,
  setRole,
  updateProfile,
  hashPassword,
  comparePassword,
  generateToken,
};
