'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_enquiries_student_level" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_enquiries_preferred_time" AS ENUM ('morning', 'afternoon', 'evening', 'flexible');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_enquiries_status" AS ENUM ('pending', 'accepted', 'declined');
    `);

    await queryInterface.createTable('enquiries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      student_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: false,
      },
      preferred_days: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      preferred_time: {
        type: Sequelize.ENUM('morning', 'afternoon', 'evening', 'flexible'),
        allowNull: false,
        defaultValue: 'flexible',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      responded_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('enquiries', ['student_id']);
    await queryInterface.addIndex('enquiries', ['tutor_id']);
    await queryInterface.addIndex('enquiries', ['status']);
    await queryInterface.addIndex('enquiries', ['created_at']);
    await queryInterface.addIndex('enquiries', ['tutor_id', 'status']);
    await queryInterface.addIndex('enquiries', ['student_id', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('enquiries');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enquiries_student_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enquiries_preferred_time";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enquiries_status";');
  },
};
