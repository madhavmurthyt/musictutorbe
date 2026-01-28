'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_student_profiles_level" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    `);

    await queryInterface.createTable('student_profiles', {
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
      level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: true,
        defaultValue: 'beginner',
      },
      preferred_instruments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.addIndex('student_profiles', ['user_id'], { unique: true });
    await queryInterface.addIndex('student_profiles', ['level']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_student_profiles_level";');
  },
};
