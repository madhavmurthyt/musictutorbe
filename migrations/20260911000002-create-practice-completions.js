'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('practice_completions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      assignment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'practice_assignments',
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
      completed_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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

    await queryInterface.addIndex('practice_completions', ['assignment_id', 'completed_date'], {
      unique: true,
      name: 'practice_completions_assignment_date_unique',
    });
    await queryInterface.addIndex('practice_completions', ['student_id', 'completed_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('practice_completions');
  },
};
