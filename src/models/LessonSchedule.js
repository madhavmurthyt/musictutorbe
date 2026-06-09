'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LessonSchedule extends Model {
    static associate(models) {
      LessonSchedule.belongsTo(models.Enquiry, {
        foreignKey: 'enquiryId',
        as: 'enquiry',
      });
      LessonSchedule.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student',
      });
      LessonSchedule.belongsTo(models.User, {
        foreignKey: 'tutorId',
        as: 'tutor',
      });
      LessonSchedule.belongsTo(models.User, {
        foreignKey: 'proposedBy',
        as: 'proposer',
      });
      LessonSchedule.hasMany(models.Lesson, {
        foreignKey: 'scheduleId',
        as: 'lessons',
      });
    }
  }

  LessonSchedule.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enquiryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'enquiries',
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
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      dayOfWeek: {
        type: DataTypes.ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
        allowNull: false,
      },
      startTime: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('proposed', 'active', 'paused', 'cancelled'),
        allowNull: false,
        defaultValue: 'proposed',
      },
      proposedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'LessonSchedule',
      tableName: 'lesson_schedules',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['student_id'] },
        { fields: ['tutor_id'] },
        { fields: ['enquiry_id'] },
        { fields: ['tutor_id', 'status'] },
        { fields: ['student_id', 'status'] },
      ],
    }
  );

  return LessonSchedule;
};
