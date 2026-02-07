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

const { TutorReview } = require('../models');

const createReview = async (tutorId, studentId, rating, reviewText) => {
    const review = await TutorReview.create({ tutorId, studentId, rating, reviewText });
    return review;
};

const updateReview = async (reviewId, rating, reviewText) => {
    const review = await TutorReview.findByPk(reviewId);    
    if (!review) {
        throw new Error('Review not found');
    }
    review.rating = rating;
    review.reviewText = reviewText;
    await review.save();
    return review;
};

const listReviews = async (tutorId, pagination) => {
    const reviews = await TutorReview.findAll({
        where: { tutorId },
        order: [['createdAt', 'DESC']], 
        limit: pagination?.limit || 10,
        offset: pagination?.offset || 0,
    });
    return reviews;
};

const recalculateTutorStats = async (tutorId) => {
    const reviews = await TutorReview.findAll({ where: { tutorId } });
    const reviewCount = reviews.length;
    const rating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
    await TutorProfile.update({ rating, reviewCount }, { where: { id: tutorId } });
};  

module.exports = {
    createReview,
    updateReview,
    listReviews,
    recalculateTutorStats,
};