'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PracticeAssignment extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'tutorId', as: 'tutor' });
      this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
      this.hasMany(models.PracticeCompletion, { foreignKey: 'assignmentId', as: 'completions' });
    }
  }

  PracticeAssignment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'PracticeAssignment',
      tableName: 'practice_assignments',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['tutor_id', 'student_id'] },
        { fields: ['student_id', 'is_active'] },
        { fields: ['tutor_id'] },
      ],
    }
  );

  return PracticeAssignment;
};
