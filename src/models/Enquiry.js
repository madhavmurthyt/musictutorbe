'use strict';

const { Model } = require('sequelize');

// ============================================
// ENQUIRY MODEL
// ============================================

module.exports = (sequelize, DataTypes) => {
  class Enquiry extends Model {
    static associate(models) {
      // Enquiry belongs to Student (User)
      Enquiry.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student',
      });

      // Enquiry belongs to Tutor (User)
      Enquiry.belongsTo(models.User, {
        foreignKey: 'tutorId',
        as: 'tutor',
      });
    }
  }

  Enquiry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      studentLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: false,
      },
      preferredDays: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        // Format: ['mon', 'wed', 'fri']
      },
      preferredTime: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'flexible'),
        allowNull: false,
        defaultValue: 'flexible',
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Enquiry',
      tableName: 'enquiries',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['student_id'] },
        { fields: ['tutor_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] },
        { fields: ['tutor_id', 'status'] },
        { fields: ['student_id', 'status'] },
      ],
    }
  );

  return Enquiry;
};
