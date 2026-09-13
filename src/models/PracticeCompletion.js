'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PracticeCompletion extends Model {
    static associate(models) {
      this.belongsTo(models.PracticeAssignment, { foreignKey: 'assignmentId', as: 'assignment' });
      this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
  }

  PracticeCompletion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      assignmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'practice_assignments',
          key: 'id',
        },
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      completedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PracticeCompletion',
      tableName: 'practice_completions',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          fields: ['assignment_id', 'completed_date'],
          unique: true,
          name: 'practice_completions_assignment_date_unique',
        },
        { fields: ['student_id', 'completed_date'] },
      ],
    }
  );

  return PracticeCompletion;
};
