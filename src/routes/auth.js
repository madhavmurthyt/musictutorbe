const express = require('express');
const authService = require('../services/auth.service');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { success, created } = require('../utils/response');
const { uploadPhoto } = require('../config/upload');
const {
  registerSchema,
  loginSchema,
  oauthSchema,
  setRoleSchema,
  updateProfileSchema,
} = require('../validators/auth.schema');

// ============================================
// AUTH ROUTES
// ============================================

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with email/password
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.validatedBody);
    return created(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedBody);
    return success(res, 200, result, 'Login successful');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/oauth
 * OAuth login (Google/Apple/Facebook)
 */
router.post('/oauth', validate(oauthSchema), async (req, res, next) => {
  try {
    const result = await authService.oauthLogin(req.validatedBody);
    return success(res, 200, result, 'OAuth login successful');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user with profile
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.userId);
    return success(res, 200, result);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/auth/role
 * Set user role (student or teacher)
 */
router.patch('/role', auth, validate(setRoleSchema), async (req, res, next) => {
  try {
    const result = await authService.setRole(req.userId, req.validatedBody.role);
    return success(res, 200, result, `Role set to ${req.validatedBody.role}`);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/auth/profile
 * Update user profile (name, photoUrl)
 */
router.patch('/profile', auth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.userId, req.validatedBody);
    return success(res, 200, result, 'Profile updated');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/upload-photo
 * Upload profile photo (multipart/form-data, field: photo). Returns { photoUrl }.
 * Client then PATCH /api/auth/profile with { photoUrl }.
 */
router.post('/upload-photo', auth, (req, res, next) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FILE', message: 'No photo file provided. Use field name: photo' },
      });
    }
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
    const photoUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${req.file.filename}`;
    return success(res, 200, { photoUrl }, 'Photo uploaded');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
