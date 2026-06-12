# Database Schema

PostgreSQL database managed via Sequelize ORM. Models in `src/models/`, migrations in `migrations/`.

## Tables

### `users`
Core authentication table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `email` | STRING | Unique |
| `password_hash` | STRING | Nullable (OAuth users may not have one) |
| `role` | ENUM | `student`, `teacher`, `admin` |
| `name` | STRING | Display name |
| `auth_provider` | STRING | `local`, `google`, `apple`, `facebook` |
| `photo_url` | STRING | Serving URL (`/api/auth/photo/{userId}`) |
| `photo_data` | BLOB | Raw image binary |
| `push_token` | STRING | Expo push notification token |

### `tutor_profiles`
Extended profile for teachers. One-to-one with `users`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `users` |
| `instrument` | STRING | Primary instrument |
| `hourly_rate` | DECIMAL | |
| `location` | STRING | City/area |
| `availability` | JSONB | `{ "monday": { "start": "09:00", "end": "17:00" }, ... }` |
| `rating` | DECIMAL | Aggregate average (auto-calculated from reviews) |
| `review_count` | INTEGER | Count of reviews |
| `bio` | TEXT | |
| `onboarding_complete` | BOOLEAN | Gates access to teacher dashboard |
| `intro_video_url` | STRING | YouTube or Instagram URL |
| `preferred_contact` | STRING | |
| `timezone` | STRING | |

### `student_profiles`
Extended profile for students. One-to-one with `users`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `users` |
| `level` | STRING | Beginner/intermediate/advanced |
| `preferred_instruments` | ARRAY(STRING) | |
| `bio` | TEXT | |

### `enquiries`
Student-to-tutor connection requests.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `student_id` | UUID | FK to `users` |
| `tutor_id` | UUID | FK to `users` |
| `message` | TEXT | Inquiry message |
| `status` | ENUM | `pending`, `accepted`, `declined` |
| `preferred_day` | STRING | |
| `preferred_time` | STRING | |

### `tutor_reviews`
Student ratings and reviews. Unique constraint on `(tutor_id, student_id)`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `tutor_id` | UUID | FK to `users` |
| `student_id` | UUID | FK to `users` |
| `rating` | INTEGER | 1-5 |
| `review_text` | TEXT | ~50 words / 350 chars max |

### `conversations`
Chat threads between student and tutor, linked to an accepted inquiry.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `student_id` | UUID | FK to `users` |
| `tutor_id` | UUID | FK to `users` |
| `enquiry_id` | UUID | FK to `enquiries` |
| `last_message_at` | DATE | For sorting conversation list |

### `messages`
Individual messages within a conversation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | FK to `conversations` |
| `sender_id` | UUID | FK to `users` |
| `content` | TEXT | Message body |
| `read` | BOOLEAN | Read receipt |

### `lesson_schedules`
Recurring schedule proposals between student and tutor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `enquiry_id` | UUID | FK to `enquiries` |
| `student_id` | UUID | FK to `users` |
| `tutor_id` | UUID | FK to `users` |
| `proposed_by` | UUID | FK to `users` (who proposed) |
| `day_of_week` | STRING | e.g. "monday" |
| `start_time` | STRING | e.g. "10:00" |
| `end_time` | STRING | e.g. "11:00" |
| `status` | ENUM | `proposed`, `accepted`, `declined` |

### `lessons`
Individual lesson instances generated from schedules.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `schedule_id` | UUID | FK to `lesson_schedules` |
| `student_id` | UUID | FK to `users` |
| `tutor_id` | UUID | FK to `users` |
| `date` | DATE | Lesson date |
| `start_time` | STRING | |
| `end_time` | STRING | |
| `status` | ENUM | `scheduled`, `completed`, `cancelled` |
| `cancelled_by` | UUID | FK to `users` |
| `notes` | TEXT | Post-lesson notes |

## Migration Conventions

- File naming: `YYYYMMDD00000N-description.js`
- Every migration must have both `up` and `down` methods
- Use `underscored: true` in models (JS camelCase maps to DB snake_case)
- All primary keys are UUIDs with `UUIDV4` default

## See Also

- **Backend overview**: `../CLAUDE.md`
- **Deployment**: `DEPLOY.md`
