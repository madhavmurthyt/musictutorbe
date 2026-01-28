// ============================================
// CUSTOM API ERROR CLASS
// ============================================

/**
 * Custom error class for API errors with status code and error code
 *
 * Usage:
 *   throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
 *   throw new ApiError(400, 'Invalid email format');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} code - Error code for frontend handling
   */
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get default error code based on status code
   */
  getDefaultCode(statusCode) {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return codes[statusCode] || 'ERROR';
  }
}

module.exports = ApiError;
