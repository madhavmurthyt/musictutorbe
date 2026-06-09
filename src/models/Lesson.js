'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    static associate(models) {
      Lesson.belongsTo(models.LessonSchedule, {
        foreignKey: 'scheduleId',
        as: 'schedule',
      });
      Lesson.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student',
      });
      Lesson.belongsTo(models.User, {
        foreignKey: 'tutorId',
        as: 'tutor',
      });
      Lesson.belongsTo(models.User, {
        foreignKey: 'cancelledBy',
        as: 'canceller',
      });
    }
  }

  Lesson.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      scheduleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'lesson_schedules',
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
      scheduledDate: {
        type: DataTypes.DATEONLY,
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
        type: DataTypes.ENUM('upcoming', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'upcoming',
      },
      teacherNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      studentNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reminder24hSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reminder15mSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      postLessonSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Lesson',
      tableName: 'lessons',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['schedule_id'] },
        { fields: ['scheduled_date', 'status'] },
        { fields: ['student_id', 'scheduled_date'] },
        { fields: ['tutor_id', 'scheduled_date'] },
        {
          fields: ['schedule_id', 'scheduled_date'],
          unique: true,
          name: 'lessons_schedule_date_unique',
        },
      ],
    }
  );

  return Lesson;
};
