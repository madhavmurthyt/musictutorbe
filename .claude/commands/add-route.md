Add a new Express route to the musictutorbe API.

## Task
$ARGUMENTS

## Patterns to follow

### 1. Validator — `src/validators/<domain>.schema.js`
Use Zod. Export named schemas. Example:
```js
const { z } = require('zod');

const createWidgetSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  value: z.number().positive(),
});

module.exports = { createWidgetSchema };
```

### 2. Service — `src/services/<domain>.service.js`
Business logic only. Throws `ApiError` for domain errors. Uses Sequelize models via `require('../models')`.
```js
const { Widget } = require('../models');
const ApiError = require('../utils/ApiError');

const createWidget = async (userId, data) => {
  const existing = await Widget.findOne({ where: { userId } });
  if (existing) throw new ApiError(409, 'Widget already exists', 'WIDGET_EXISTS');
  return Widget.create({ userId, ...data });
};

module.exports = { createWidget };
```

### 3. Route — `src/routes/<domain>.js`
Standard structure: import middleware + validators + service + response helpers, build `express.Router()`, export it.
```js
const express = require('express');
const { auth } = require('../middleware/auth');
const { requireTeacher } = require('../middleware/requireRole'); // or requireStudent, requireAdmin
const validate = require('../middleware/validate');
const { success, created, paginatedWithKey } = require('../utils/response');
const widgetService = require('../services/widget.service');
const { createWidgetSchema } = require('../validators/widget.schema');

const router = express.Router();

router.post('/', auth, requireTeacher, validate(createWidgetSchema), async (req, res, next) => {
  try {
    const widget = await widgetService.createWidget(req.userId, req.validatedBody);
    return created(res, { widget }, 'Widget created');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

**Middleware notes**:
- `auth` — verifies JWT, sets `req.userId` and `req.userRole`.
- `requireTeacher` / `requireStudent` / `requireAdmin` — role checks (must come after `auth`).
- `validate(schema)` — validates `req.body`, stores result in `req.validatedBody`.
- `validate(schema, 'query')` — validates `req.query`, stores in `req.validatedQuery`.

**Response helpers** (`src/utils/response.js`):
- `success(res, statusCode, data, message)` — generic success.
- `created(res, data, message)` — 201.
- `paginatedWithKey(res, key, items, { page, limit, total })` — paginated list under `data[key]`.
- `noContent(res)` — 204.

**Error format**: Throw `new ApiError(statusCode, message, code)`. The error handler in `src/middleware/errorHandler.js` catches it and returns `{ success: false, error: { code, message } }`.

### 4. Register the router — `src/routes/index.js`
Add a `router.use('/api/<domain>', require('./<domain>'))` line.

## Deliverables
1. `src/validators/<domain>.schema.js` (new or updated).
2. `src/services/<domain>.service.js` (new or updated).
3. `src/routes/<domain>.js` (new or updated).
4. Updated `src/routes/index.js` if a new router was created.
5. Summary of impacted files.
