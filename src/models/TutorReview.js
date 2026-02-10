/*

**What to do**

1. Define the model with the same columns as the migration (`tutorId`, `studentId`, `rating`, `reviewText`, etc.).
2. In `associate`, set:
   - **belongsTo** User as `tutor` (foreignKey: `tutorId`)
   - **belongsTo** User as `student` (foreignKey: `studentId`)
3. Use `tableName: 'tutor_reviews'` and `underscored: true` if your migration uses snake_case columns.

**Layman summary:** This is the Sequelize model for the new table so the app can read/write reviews.

*/

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    
class TutorReview extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'tutorId', as: 'tutor' });
        this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
}

TutorReview.init({
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    reviewText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },  
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'TutorReview',
    tableName: 'tutor_reviews',
    underscored: true,
    timestamps: true,
    indexes: [
        { fields: ['tutor_id'] },
        { fields: ['student_id'] },
    ],
});

return TutorReview;
};