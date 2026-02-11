# 🎵 Music Tutor Backend API

Express.js + PostgreSQL backend for the Music Tutor mobile app - connecting students with Mridangam teachers.

## Tech Stack

- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL + Sequelize ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod
- **Security**: Helmet, CORS

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone and navigate
cd musictutorbe

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL connection
DATABASE_URL=postgresql://user:password@localhost:5432/musictutor

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:19006,http://localhost:8081
```

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API info |

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register with email/password | No |
| POST | `/login` | Login with email/password | No |
| POST | `/oauth` | OAuth login (Google/Apple/Facebook) | No |
| GET | `/me` | Get current user + profile | Yes |
| PATCH | `/role` | Set user role (student/teacher) | Yes |
| PATCH | `/profile` | Update name/photo | Yes |

### Tutors (`/api/tutors`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List tutors (with filters) | No |
| GET | `/:id` | Get tutor details | No |
| POST | `/` | Create/update tutor profile | Teacher |
| PATCH | `/` | Partial update profile | Teacher |
| PATCH | `/availability` | Update availability | Teacher |

**Query Parameters for GET /tutors:**
- `instrument` - Filter by instrument name
- `city`, `state` - Filter by location
- `minRate`, `maxRate` - Filter by hourly rate
- `proficiencyLevel` - beginner/intermediate/advanced/expert
- `isVerified` - Boolean filter
- `page`, `limit` - Pagination (default: 1, 20)
- `sortBy` - rating/hourlyRate/yearsOfExperience/createdAt
- `sortOrder` - asc/desc

### Enquiries (`/api/enquiries`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Send enquiry to tutor | Student |
| GET | `/` | List enquiries (sent/received) | Student/Teacher |
| GET | `/stats` | Get enquiry statistics | Teacher |
| GET | `/:id` | Get single enquiry | Owner |
| PATCH | `/:id` | Accept/decline enquiry | Teacher |

## Database Schema

```
users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── name
├── photo_url
├── role (student/teacher/admin)
├── auth_provider (email/google/apple/facebook)
└── timestamps

student_profiles
├── id (UUID, PK)
├── user_id (FK → users)
├── level (beginner/intermediate/advanced/expert)
├── preferred_instruments (array)
└── bio

tutor_profiles
├── id (UUID, PK)
├── user_id (FK → users)
├── instrument
├── proficiency_level
├── hourly_rate
├── city, state, country
├── bio
├── availability (JSONB)
├── is_verified
├── years_of_experience
├── rating, review_count
└── onboarding_complete

enquiries
├── id (UUID, PK)
├── student_id (FK → users)
├── tutor_id (FK → users)
├── message
├── student_level
├── preferred_days (array)
├── preferred_time
├── status (pending/accepted/declined)
└── responded_at
```

## Scripts

```bash
npm start           # Start production server
npm run dev         # Start with nodemon (hot reload)

npm run db:migrate      # Run migrations
npm run db:migrate:undo # Undo last migration
npm run db:seed         # Seed test data
npm run db:reset        # Reset DB (undo all + migrate + seed)
```

## Test Accounts

After running seeds, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@musictutor.com | password123 |
| Teacher | guru.raghunath@musictutor.com | password123 |
| Teacher | priya.venkatesh@musictutor.com | password123 |
| Student | alex.johnson@gmail.com | password123 |
| Student | maya.patel@gmail.com | password123 |

## Project Structure

```
musictutorbe/
├── src/
│   ├── index.js              # Express app entry
│   ├── config/
│   │   └── database.js       # Sequelize config
│   ├── models/               # Sequelize models
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, validation, errors
│   ├── services/             # Business logic
│   ├── validators/           # Zod schemas
│   └── utils/                # Helpers
├── migrations/               # DB migrations
├── seeders/                  # Test data
├── .env                      # Environment vars
└── package.json
```

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email: Invalid email format"
  }
}
```

## Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## License

MIT
