'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    // ADD VALUE cannot run inside a transaction in PostgreSQL; run without transaction
    await sequelize.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_tutor_profiles_proficiency_level'
          AND e.enumlabel = 'master'
        ) THEN
          ALTER TYPE enum_tutor_profiles_proficiency_level ADD VALUE 'master';
        END IF;
      END $$;`,
      { transaction: false }
    );
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL does not support removing an enum value easily.
    // To fully revert, you would need to create a new type without 'master',
    // migrate the column, drop the old type, and rename. Skipping down for safety.
    // Run down only if you are resetting the DB; otherwise leave enum as-is.
  },
};
