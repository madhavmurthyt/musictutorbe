'use strict';

const { Model } = require('sequelize');

// ============================================
// TUTOR PROFILE MODEL
// ============================================

module.exports = (sequelize, DataTypes) => {
  class TutorProfile extends Model {
    static associate(models) {
      // TutorProfile belongs to User
      TutorProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }

    // Get public-facing tutor data
    toPublicObject() {
      return {
        id: this.userId, // Use userId as the tutor ID for API consistency
        instrument: this.instrument,
        proficiencyLevel: this.proficiencyLevel,
        location: {
          city: this.city,
          state: this.state,
          country: this.country,
        },
        hourlyRate: parseFloat(this.hourlyRate),
        bio: this.bio,
        availability: this.availability || [],
        timeZoneAvailability: this.timeZoneAvailability || [],
        preferredContactMode: this.preferredContactMode,
        preferredContactValue: this.preferredContactValue,
        isOnline: this.isOnline,
        isVerified: this.isVerified,
        yearsOfExperience: this.yearsOfExperience,
        rating: parseFloat(this.rating) || 0,
        reviewCount: this.reviewCount,
      };
    }
  }

  TutorProfile.init(
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
      instrument: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      proficiencyLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert', 'master'),
        allowNull: true,
      },
      hourlyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India',
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      availability: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        // Format: [{ day: 'mon', startTime: '09:00', endTime: '17:00' }]
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0,
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      onboardingComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      preferredContactMode: {
        type: DataTypes.ENUM('email', 'phone'),
        allowNull: true,
      },
      preferredContactValue: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      timeZoneAvailability: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        // Time along with time zone: each slot is { timeZone, startTime, endTime } e.g. 8am–9am EST
      },
    },
    {
      sequelize,
      modelName: 'TutorProfile',
      tableName: 'tutor_profiles',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['user_id'], unique: true },
        { fields: ['instrument'] },
        { fields: ['city', 'state'] },
        { fields: ['proficiency_level'] },
        { fields: ['hourly_rate'] },
        { fields: ['is_online'] },
        { fields: ['is_verified'] },
        { fields: ['onboarding_complete'] },
      ],
    }
  );

  return TutorProfile;
};
