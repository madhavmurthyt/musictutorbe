'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_tutor_profiles_preferred_contact_mode" AS ENUM ('email', 'phone');`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE tutor_profiles ADD COLUMN preferred_contact_mode "enum_tutor_profiles_preferred_contact_mode" NULL;`
    );
    await queryInterface.addColumn(
      'tutor_profiles',
      'preferred_contact_value',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'tutor_profiles',
      'time_zone_availability',
      {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      }
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE tutor_profiles ALTER COLUMN instrument SET DEFAULT NULL;`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tutor_profiles', 'time_zone_availability');
    await queryInterface.removeColumn('tutor_profiles', 'preferred_contact_value');
    await queryInterface.removeColumn('tutor_profiles', 'preferred_contact_mode');
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_tutor_profiles_preferred_contact_mode";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE tutor_profiles ALTER COLUMN instrument SET DEFAULT 'Mridangam';`
    );
  },
};
