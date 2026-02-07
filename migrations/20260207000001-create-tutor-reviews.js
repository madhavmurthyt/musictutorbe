/*
    2. In the migration, create a table `tutor_reviews` with:
   - `id` (UUID, primary key)
   - `tutor_id` (UUID, FK to `users.id` – the teacher)
   - `student_id` (UUID, FK to `users.id` – the student who wrote the review)
   - `rating` (integer, 1–5)
   - `review_text` (TEXT, for ~50 words ≈ 350 characters)
   - `created_at`, `updated_at`
3. Add a **unique constraint** on `(tutor_id, student_id)` so each student can have only one review per tutor (if they submit again, you update that row).
4. Add indexes on `tutor_id` and `student_id` for listing and lookups.

*/

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tutor_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tutor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { 
            min: 1,
            max: 5,
        },
    },
    review_text: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            len: [1, 350],
        },
    },
    created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
});

await queryInterface.addIndex('tutor_reviews', ['tutor_id']);
await queryInterface.addIndex('tutor_reviews', ['student_id']); 
},
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tutor_reviews');
    }
};  