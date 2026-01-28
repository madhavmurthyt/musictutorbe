const ApiError = require('../utils/ApiError');

// ============================================
// ZOD VALIDATION MIDDLEWARE
// ============================================

/**
 * Validates request data against a Zod schema
 *
 * Usage:
 *   const { createTutorSchema } = require('../validators/tutor.schema');
 *   router.post('/tutors', auth, validate(createTutorSchema), createTutor);
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params', or 'all'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;

      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'all':
          dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
          };
          break;
        default:
          dataToValidate = req.body;
      }

      // Parse and validate data
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errorMessages = result.error.errors
          .map((e) => {
            const path = e.path.join('.');
            return path ? `${path}: ${e.message}` : e.message;
          })
          .join(', ');

        throw new ApiError(400, errorMessages, 'VALIDATION_ERROR');
      }

      // Attach validated data to request
      if (source === 'body') {
        req.validatedBody = result.data;
      } else if (source === 'query') {
        req.validatedQuery = result.data;
      } else if (source === 'params') {
        req.validatedParams = result.data;
      } else {
        req.validated = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
