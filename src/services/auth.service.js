const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const { User, StudentProfile, TutorProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const { formatTutorProfileForApi } = require('./tutor.service');

// ============================================
// AUTH SERVICE
// ============================================

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// OAuth client IDs (for server-side verification)
// Google: support Web (expo-auth-session), iOS and Android (native @react-native-google-signin)
const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
].filter(Boolean);
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || process.env.APPLE_BUNDLE_ID;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;

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
 * Verify Google id_token and return payload (sub, email, name, picture).
 * Accepts tokens from Web, iOS, or Android client (audience must match one of GOOGLE_CLIENT_IDS).
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!GOOGLE_CLIENT_IDS.length) {
    throw new ApiError(503, 'Google OAuth not configured', 'OAUTH_NOT_CONFIGURED');
  }
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new ApiError(401, 'Invalid Google token', 'INVALID_OAUTH_TOKEN');
  }
  return {
    sub: payload.sub,
    email: payload.email || null,
    name: payload.name || null,
    picture: payload.picture || null,
  };
};

/**
 * Verify Apple id_token (JWT) using Apple's JWKS
 */
const verifyAppleIdToken = async (idToken) => {
  if (!APPLE_CLIENT_ID) {
    throw new ApiError(503, 'Apple Sign In not configured', 'OAUTH_NOT_CONFIGURED');
  }
  const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
    timeout: 30000,
  });

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      if (!key) return callback(new Error('Signing key not found'));
      const publicKey = key.getPublicKey();
      callback(null, publicKey);
    });
  };

  return new Promise((resolve, reject) => {
    jwt.verify(idToken, getKey, { algorithms: ['RS256'] }, (err, payload) => {
      if (err) {
        return reject(new ApiError(401, 'Invalid Apple token', 'INVALID_OAUTH_TOKEN'));
      }
      if (payload.iss !== 'https://appleid.apple.com' && payload.iss !== 'https://apple.appleid.com') {
        return reject(new ApiError(401, 'Invalid Apple token issuer', 'INVALID_OAUTH_TOKEN'));
      }
      if (payload.aud !== APPLE_CLIENT_ID) {
        return reject(new ApiError(401, 'Invalid Apple token audience', 'INVALID_OAUTH_TOKEN'));
      }
      resolve({
        sub: payload.sub,
        email: payload.email || null,
        name: payload.name ? [payload.name.givenName, payload.name.familyName].filter(Boolean).join(' ') : null,
        picture: null,
      });
    });
  });
};

/**
 * Verify Facebook access_token by calling Graph API
 */
const verifyFacebookAccessToken = async (accessToken) => {
  if (!FACEBOOK_APP_ID) {
    throw new ApiError(503, 'Facebook OAuth not configured', 'OAUTH_NOT_CONFIGURED');
  }
  const url = `https://graph.facebook.com/v21.0/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(401, 'Invalid Facebook token', 'INVALID_OAUTH_TOKEN');
  }
  const data = await res.json();
  if (!data.id) {
    throw new ApiError(401, 'Invalid Facebook token', 'INVALID_OAUTH_TOKEN');
  }
  const picture = data.picture?.data?.url || null;
  return {
    sub: data.id,
    email: data.email || null,
    name: data.name || null,
    picture,
  };
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
 * Get user details and auth routing info (role, hasCompletedOnboarding).
 * Single place: load user from DB; if role is teacher, resolve onboarding from tutor profile.
 * Used by login, oauthLogin, and getCurrentUser so routing logic is not duplicated.
 */
const getUserAuthPayload = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'name', 'photoUrl', 'role', 'authProvider', 'createdAt'],
  });
  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  let hasCompletedOnboarding = true;
  if (user.role === 'teacher') {
    const tutorProfile = await TutorProfile.findOne({ where: { userId: user.id } });
    hasCompletedOnboarding = tutorProfile?.onboardingComplete ?? false;
  }

  return { user, hasCompletedOnboarding };
};

/**
 * Login with email/password
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'passwordHash'],
  });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.passwordHash) {
    throw new ApiError(
      401,
      'This account uses social login. Please sign in with Google, Apple, or Facebook.',
      'SOCIAL_LOGIN_REQUIRED'
    );
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const { user: userWithRole, hasCompletedOnboarding } = await getUserAuthPayload(user.id);
  const token = generateToken(userWithRole);

  return {
    user: userWithRole.toSafeObject(),
    token,
    hasCompletedOnboarding,
  };
};

/**
 * OAuth login (Google/Apple/Facebook)
 * Verifies id_token/access_token with provider, then create/link user and issue JWT.
 * Same behavior in all environments; requires provider credentials to be configured.
 */
const oauthLogin = async ({ provider, idToken, accessToken, email, name, photoUrl }) => {
  let payload;

  if (provider === 'google') {
    if (!idToken) throw new ApiError(400, 'ID token required for Google', 'VALIDATION_ERROR');
    payload = await verifyGoogleIdToken(idToken);
  } else if (provider === 'apple') {
    if (!idToken) throw new ApiError(400, 'ID token required for Apple', 'VALIDATION_ERROR');
    payload = await verifyAppleIdToken(idToken);
  } else if (provider === 'facebook') {
    const token = accessToken || idToken;
    if (!token) throw new ApiError(400, 'Access token or ID token required for Facebook', 'VALIDATION_ERROR');
    payload = await verifyFacebookAccessToken(token);
  } else {
    throw new ApiError(400, 'Invalid provider', 'VALIDATION_ERROR');
  }

  const authProviderId = payload.sub;
  const verifiedEmail = payload.email || email;
  const verifiedName = payload.name || name;
  const verifiedPhotoUrl = payload.picture || photoUrl;

  let user = await User.findOne({
    where: {
      authProvider: provider,
      authProviderId,
    },
  });

  let isNewUser = false;

  if (!user && verifiedEmail) {
    user = await User.findOne({ where: { email: verifiedEmail } });
    if (user) {
      user.authProvider = provider;
      user.authProviderId = authProviderId;
      if (verifiedPhotoUrl) user.photoUrl = verifiedPhotoUrl;
      if (verifiedName) user.name = verifiedName;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      email: verifiedEmail || `${authProviderId}@${provider}.oauth`,
      name: verifiedName || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      photoUrl: verifiedPhotoUrl,
      authProvider: provider,
      authProviderId,
    });
    isNewUser = true;
  }

  const { user: userFromDb, hasCompletedOnboarding } = await getUserAuthPayload(user.id);
  const token = generateToken(userFromDb);

  return {
    user: userFromDb.toSafeObject(),
    token,
    isNewUser,
    hasCompletedOnboarding,
  };
};

/**
 * Get current user with profile and routing info.
 * Uses getUserAuthPayload for user + role + hasCompletedOnboarding; then loads profile by role.
 */
const getCurrentUser = async (userId) => {
  const { user, hasCompletedOnboarding } = await getUserAuthPayload(userId);

  let profile = null;
  if (user.role === 'student') {
    const studentProfile = await StudentProfile.findOne({ where: { userId: user.id } });
    if (studentProfile) {
      profile = {
        level: studentProfile.level,
        preferredInstruments: Array.isArray(studentProfile.preferredInstruments) ? studentProfile.preferredInstruments : [],
        bio: studentProfile.bio ?? undefined,
      };
    }
  } else if (user.role === 'teacher') {
    const tutorProfile = await TutorProfile.findOne({ where: { userId: user.id } });
    if (tutorProfile) {
      profile = formatTutorProfileForApi(tutorProfile);
    }
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

  // Update role and persist
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

  const { user: updatedUser } = await getUserAuthPayload(userId);
  const token = generateToken(updatedUser);

  return {
    user: updatedUser.toSafeObject(),
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
