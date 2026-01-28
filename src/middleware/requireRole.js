const ApiError = require('../utils/ApiError');

// ============================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ============================================

/**
 * Requires user to have one of the specified roles
 * Must be used AFTER auth middleware
 *
 * Usage:
 *   router.post('/tutors', auth, requireRole('teacher'), createTutor)
 *   router.get('/admin', auth, requireRole('admin'), adminHandler)
 *   router.get('/any-role', auth, requireRole('student', 'teacher'), handler)
 *
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure auth middleware has run
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'AUTH_REQUIRED'));
    }

    // Check if user has a role set
    if (!req.user.role) {
      return next(new ApiError(403, 'Please select a role first', 'NO_ROLE'));
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

// ============================================
// CONVENIENCE MIDDLEWARE
// ============================================

// Require student role
const requireStudent = requireRole('student');

// Require teacher role
const requireTeacher = requireRole('teacher');

// Require admin role
const requireAdmin = requireRole('admin');

// Require student or teacher (authenticated user with role)
const requireUser = requireRole('student', 'teacher');

// Require teacher or admin
const requireTeacherOrAdmin = requireRole('teacher', 'admin');

module.exports = {
  requireRole,
  requireStudent,
  requireTeacher,
  requireAdmin,
  requireUser,
  requireTeacherOrAdmin,
};
