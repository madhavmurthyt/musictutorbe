'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    await sequelize.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_student_profiles_level'
          AND e.enumlabel = 'master'
        ) THEN
          ALTER TYPE enum_student_profiles_level ADD VALUE 'master';
        END IF;
      END $$;`,
      { transaction: false }
    );
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL does not support removing an enum value easily; skip down for safety.
  },
};
