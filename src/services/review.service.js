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

const { TutorReview, TutorProfile, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Submit review: create or update the one review per (tutorId, studentId), then recalc tutor stats.
 */
const submitReview = async (tutorId, studentId, rating, reviewText) => {
  const [review] = await TutorReview.findOrCreate({
    where: { tutorId, studentId },
    defaults: { tutorId, studentId, rating, reviewText },
  });
  if (!review) {
    throw new ApiError(500, 'Failed to create or find review', 'REVIEW_ERROR');
  }
  review.rating = rating;
  review.reviewText = reviewText || '';
  await review.save();
  await recalculateTutorStats(tutorId);
  return review;
};

/**
 * Recalculate tutor's aggregate rating and review count; update tutor_profiles.
 * TutorProfile is keyed by userId (tutor's user id).
 */
const recalculateTutorStats = async (tutorId) => {
  const reviews = await TutorReview.findAll({ where: { tutorId } });
  const reviewCount = reviews.length;
  const rating =
    reviewCount === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10;
  await TutorProfile.update(
    { rating, reviewCount },
    { where: { userId: tutorId } }
  );
};

/**
 * List reviews for a tutor with student names.
 */
const listReviewsForTutor = async (tutorId, options = {}) => {
  const limit = Math.min(options.limit || 20, 50);
  const offset = options.page ? (options.page - 1) * limit : 0;
  const { count, rows } = await TutorReview.findAndCountAll({
    where: { tutorId },
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  return {
    reviews: rows.map((r) => ({
      id: r.id,
      tutorId: r.tutorId,
      studentId: r.studentId,
      studentName: r.student?.name ?? 'Student',
      rating: r.rating,
      reviewText: r.reviewText,
      createdAt: r.createdAt,
    })),
    pagination: {
      page: options.page || 1,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  submitReview,
  recalculateTutorStats,
  listReviewsForTutor,
};