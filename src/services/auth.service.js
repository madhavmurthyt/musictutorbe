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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID;
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
 * Verify Google id_token and return payload (sub, email, name, picture)
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google OAuth not configured', 'OAUTH_NOT_CONFIGURED');
  }
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
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
 * Login with email/password
 */
const login = async ({ email, password }) => {
  // Find user with profile for onboarding status
  const user = await User.findOne({
    where: { email },
    include: [
      { model: TutorProfile, as: 'tutorProfile', required: false },
    ],
  });
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

  // For teachers, include onboarding status so app can route correctly
  let hasCompletedOnboarding = true;
  if (user.role === 'teacher') {
    hasCompletedOnboarding = user.tutorProfile?.onboardingComplete ?? false;
  }

  return {
    user: user.toSafeObject(),
    token,
    hasCompletedOnboarding,
  };
};

/**
 * Dev-only: trust client when OAuth is not configured (for mock SSO)
 */
const devTrustOAuthPayload = (provider, idToken, accessToken, email, name, photoUrl) => {
  if (process.env.NODE_ENV !== 'development') return null;
  const token = accessToken || idToken;
  if (!token) return null;
  const authProviderId = `${provider}-${Buffer.from(token).toString('base64').slice(0, 32)}`;
  return {
    sub: authProviderId,
    email: email || null,
    name: name || null,
    picture: photoUrl || null,
  };
};

/**
 * OAuth login (Google/Apple/Facebook)
 * Verifies id_token/access_token with provider, then create/link user and issue JWT
 */
const oauthLogin = async ({ provider, idToken, accessToken, email, name, photoUrl }) => {
  let payload;

  try {
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
  } catch (err) {
    if (err.code === 'OAUTH_NOT_CONFIGURED') {
      const devPayload = devTrustOAuthPayload(provider, idToken, accessToken, email, name, photoUrl);
      if (devPayload) payload = devPayload;
      else throw err;
    } else {
      throw err;
    }
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

  const token = generateToken(user);

  // Include onboarding status for routing (same as email login)
  let hasCompletedOnboarding = true;
  const userWithProfile = await User.findByPk(user.id, {
    include: [{ model: TutorProfile, as: 'tutorProfile', required: false }],
  });
  if (userWithProfile?.role === 'teacher') {
    hasCompletedOnboarding = userWithProfile.tutorProfile?.onboardingComplete ?? false;
  }

  return {
    user: user.toSafeObject(),
    token,
    isNewUser,
    hasCompletedOnboarding,
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

  // Determine which profile to return (normalized shape for store hydration and edit forms)
  let profile = null;
  let hasCompletedOnboarding = true;

  if (user.role === 'student' && user.studentProfile) {
    const p = user.studentProfile;
    profile = {
      level: p.level,
      preferredInstruments: Array.isArray(p.preferredInstruments) ? p.preferredInstruments : [],
      bio: p.bio ?? undefined,
    };
  } else if (user.role === 'teacher' && user.tutorProfile) {
    profile = formatTutorProfileForApi(user.tutorProfile);
    hasCompletedOnboarding = user.tutorProfile.onboardingComplete ?? false;
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
