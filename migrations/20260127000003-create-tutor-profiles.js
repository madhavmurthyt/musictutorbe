'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_tutor_profiles_proficiency_level" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    `);

    await queryInterface.createTable('tutor_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      instrument: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Mridangam',
      },
      proficiency_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: true,
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'India',
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      availability: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      years_of_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0,
      },
      review_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      onboarding_complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Add indexes
    await queryInterface.addIndex('tutor_profiles', ['user_id'], { unique: true });
    await queryInterface.addIndex('tutor_profiles', ['instrument']);
    await queryInterface.addIndex('tutor_profiles', ['city', 'state']);
    await queryInterface.addIndex('tutor_profiles', ['proficiency_level']);
    await queryInterface.addIndex('tutor_profiles', ['hourly_rate']);
    await queryInterface.addIndex('tutor_profiles', ['is_online']);
    await queryInterface.addIndex('tutor_profiles', ['is_verified']);
    await queryInterface.addIndex('tutor_profiles', ['onboarding_complete']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tutor_profiles');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tutor_profiles_proficiency_level";'
    );
  },
};
