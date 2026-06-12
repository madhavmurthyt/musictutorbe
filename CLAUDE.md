# Naada Guru — Backend

Express.js API for the Naada Guru Carnatic music tutoring marketplace.

## Commands

```bash
npm run dev            # Nodemon hot reload (localhost:3001)
npm start              # Production server
npm run db:migrate     # Run pending Sequelize migrations
npm run db:seed        # Seed test data
npm run db:reset       # Undo all migrations + migrate + seed
npm run db:migrate:undo  # Undo last migration
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5434/musictutor
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:19006,http://localhost:8081,http://localhost:3000
GOOGLE_CLIENT_ID=...          # For verifying Google SSO tokens
APPLE_CLIENT_ID=...           # For verifying Apple SSO tokens
FACEBOOK_APP_ID=...           # For verifying Facebook SSO tokens
```

## Architecture

- **Framework**: Express.js with Helmet (security headers), CORS, Morgan (logging)
- **ORM**: Sequelize with PostgreSQL. Models in `src/models/`, migrations in `migrations/`, seeders in `seeders/`
- **Auth**: JWT Bearer tokens. `src/middleware/auth.js` verifies tokens; `src/middleware/requireRole.js` enforces role-based access
- **Validation**: Zod schemas in `src/validators/` applied per route
- **Response format**: Standardized via `src/utils/` (ApiError class + response formatter)
- **Route structure**: `src/routes/` — `auth`, `tutors`, `enquiries`, `reviews`, `students`, `lessons`, `messages`, `landing`, `legal`
- **Push notifications**: `src/services/push.service.js` sends via `expo-server-sdk`
- **Scheduled jobs**: `src/cron/lessonCron.js` — 24h/15m lesson reminders, post-lesson prompts

## Database Schema (summary)

| Table | Purpose |
|-------|---------|
| `users` | Core auth (email, password_hash, role, auth_provider, push_token, photo_data) |
| `tutor_profiles` | Instrument, hourly_rate, location, availability (JSONB), rating, intro_video_url |
| `student_profiles` | Level, preferred_instruments, bio |
| `enquiries` | Student-to-tutor connection requests (status: pending/accepted/declined) |
| `tutor_reviews` | Ratings + review text (unique per student-tutor pair) |
| `conversations` | Chat threads between student and tutor (linked to enquiry) |
| `messages` | Individual messages within a conversation |
| `lesson_schedules` | Recurring schedule proposals (day, time, status: proposed/accepted/declined) |
| `lessons` | Individual lesson instances generated from schedules |

Full schema details: `docs/DATABASE_SCHEMA.md`

## Test Accounts (after seeding)

All use password `password123`. Includes admin, 2 teachers, 2 students — see `seeders/` for exact emails.

## Custom Slash Commands

| Command | Purpose |
|---------|---------|
| `/add-route` | Add an Express route following the validator -> service -> route pattern |
| `/add-migration` | Create a reversible Sequelize migration with `up`/`down` and update the model |
| `/add-model` | Scaffold a new Sequelize model + migration + associations |

## See Also

- **Workspace overview**: `../CLAUDE.md` — accounts, OAuth package names, machine setup
- **Deployment (Render)**: `docs/DEPLOY.md`
- **Full database schema**: `docs/DATABASE_SCHEMA.md`
- **Push notification architecture**: `../musictutor/docs/PUSH_NOTIFICATIONS.md`
- **Cross-cutting architecture**: `../docs/ARCHITECTURE.md`
- **Feature roadmap**: `../docs/ROADMAP.md`
