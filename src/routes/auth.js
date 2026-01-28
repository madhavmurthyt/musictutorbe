const express = require('express');
const authService = require('../services/auth.service');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { success, created } = require('../utils/response');
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

module.exports = router;
