'use strict';

const { Model } = require('sequelize');

// ============================================
// USER MODEL
// ============================================

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has one StudentProfile (if role is 'student')
      User.hasOne(models.StudentProfile, {
        foreignKey: 'userId',
        as: 'studentProfile',
        onDelete: 'CASCADE',
      });

      // User has one TutorProfile (if role is 'teacher')
      User.hasOne(models.TutorProfile, {
        foreignKey: 'userId',
        as: 'tutorProfile',
        onDelete: 'CASCADE',
      });

      // User (as student) can have many sent enquiries
      User.hasMany(models.Enquiry, {
        foreignKey: 'studentId',
        as: 'sentEnquiries',
      });

      // User (as teacher) can have many received enquiries
      User.hasMany(models.Enquiry, {
        foreignKey: 'tutorId',
        as: 'receivedEnquiries',
      });
    }

    // Instance method to get safe user data (no password)
    toSafeObject() {
      const { id, email, name, photoUrl, role, authProvider, createdAt } = this;
      return { id, email, name, photoUrl, role, authProvider, createdAt };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: true, // Nullable for OAuth users
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('student', 'teacher', 'admin'),
        allowNull: true, // Null until user selects role
      },
      authProvider: {
        type: DataTypes.ENUM('email', 'google', 'apple', 'facebook'),
        allowNull: false,
        defaultValue: 'email',
      },
      authProviderId: {
        type: DataTypes.STRING(255),
        allowNull: true, // External OAuth ID
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['role'] },
        { fields: ['auth_provider', 'auth_provider_id'] },
      ],
    }
  );

  return User;
};
