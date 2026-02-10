/*
**What to do**

1. **Submit review (create or update)**  
   - Input: `tutorId`, `studentId`, `rating` (1–5), `reviewText` (string, max length ~350).  
   - Validate rating 1–5 and length (e.g. max 350 chars for ~50 words).  
   - Find or create a row in `tutor_reviews` for this `(tutorId, studentId)` (unique).  
   - If found, update `rating` and `review_text`; if not, create.  
   - Then call a small helper that **recalculates** the tutor’s aggregate stats (see below).

2. **Recalculate tutor rating and review count**  
   - For the given `tutorId`, run a query on `tutor_reviews` for that tutor:  
     - `reviewCount` = number of rows.  
     - `rating` = average of `rating` column (rounded to 1 decimal).  
   - Update `tutor_profiles` for that tutor: set `rating` and `review_count` to these values.

3. **List reviews for a tutor**  
   - Input: `tutorId`, optional pagination.  
   - Return rows from `tutor_reviews` for that tutor, including student name (join User on `student_id`).  
   - Return e.g. `{ id, tutorId, studentId, studentName, rating, reviewText, createdAt }` for each.

**Layman summary:** When a student submits a rating + review, save (or update) it in `tutor_reviews`, then recompute the tutor’s overall rating and review count and save that on `tutor_profiles`. Another function returns the list of reviews for a tutor.

---
*/

const { z } = require('zod');

/** Body for POST /api/tutors/:id/reviews (tutorId from params, studentId from auth) */
const submitReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  reviewText: z
    .string()
    .max(350, 'Review must be 50 words or less (~350 characters)')
    .optional()
    .default(''),
});

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

module.exports = {
  submitReviewBodySchema,
  listReviewsQuerySchema,
};