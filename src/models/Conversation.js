'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student',
      });
      Conversation.belongsTo(models.User, {
        foreignKey: 'tutorId',
        as: 'tutor',
      });
      Conversation.belongsTo(models.Enquiry, {
        foreignKey: 'enquiryId',
        as: 'enquiry',
      });
      Conversation.hasMany(models.Message, {
        foreignKey: 'conversationId',
        as: 'messages',
      });
    }
  }

  Conversation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enquiryId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
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
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Conversation',
      tableName: 'conversations',
      underscored: true,
      timestamps: true,
    }
  );

  return Conversation;
};
