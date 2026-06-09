'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_schedules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      enquiry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'enquiries',
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
      day_of_week: {
        type: Sequelize.ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('proposed', 'active', 'paused', 'cancelled'),
        allowNull: false,
        defaultValue: 'proposed',
      },
      proposed_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('lesson_schedules', ['student_id']);
    await queryInterface.addIndex('lesson_schedules', ['tutor_id']);
    await queryInterface.addIndex('lesson_schedules', ['enquiry_id']);
    await queryInterface.addIndex('lesson_schedules', ['tutor_id', 'status']);
    await queryInterface.addIndex('lesson_schedules', ['student_id', 'status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lesson_schedules');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_lesson_schedules_day_of_week";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_lesson_schedules_status";');
  },
};
