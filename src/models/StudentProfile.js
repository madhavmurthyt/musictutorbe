'use strict';

const { Model } = require('sequelize');

// ============================================
// STUDENT PROFILE MODEL
// ============================================

module.exports = (sequelize, DataTypes) => {
  class StudentProfile extends Model {
    static associate(models) {
      // StudentProfile belongs to User
      StudentProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  StudentProfile.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: true,
        defaultValue: 'beginner',
      },
      preferredInstruments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'StudentProfile',
      tableName: 'student_profiles',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['user_id'], unique: true },
        { fields: ['level'] },
      ],
    }
  );

  return StudentProfile;
};
