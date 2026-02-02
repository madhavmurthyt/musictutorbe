// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Send a successful response
 *
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} data - Response data
 * @param {string} message - Optional success message
 */
const success = (res, statusCode = 200, data = null, message = null) => {
  const response = {
    success: true,
  };

  if (data !== null) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 *
 * @param {Response} res - Express response object
 * @param {Array} items - Array of items
 * @param {object} pagination - Pagination info { page, limit, total }
 */
const paginated = (res, items, pagination) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
};

/**
 * Send a paginated response with list and pagination under data (for list endpoints).
 * Response: { success: true, data: { [key]: items, pagination } }
 *
 * @param {Response} res - Express response object
 * @param {string} key - Key for the items array (e.g. 'tutors', 'enquiries')
 * @param {Array} items - Array of items
 * @param {object} pagination - Pagination info { page, limit, total }
 */
const paginatedWithKey = (res, key, items, pagination) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      [key]: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    },
  });
};

/**
 * Send a created response (201)
 */
const created = (res, data, message = 'Created successfully') => {
  return success(res, 201, data, message);
};

/**
 * Send a no content response (204)
 */
const noContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  success,
  paginated,
  paginatedWithKey,
  created,
  noContent,
};
