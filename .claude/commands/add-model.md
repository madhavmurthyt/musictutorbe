Add a new Sequelize model (and its migration) to musictutorbe.

## Task
$ARGUMENTS

## Steps

### 1. Create the migration
```bash
cd musictutorbe
npx sequelize-cli migration:generate --name create-<table-name>
```

Fill in `migrations/YYYYMMDDHHMMSS-create-<table-name>.js`:
```js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('<table_name>', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // ... your columns ...
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('<table_name>');
  },
};
```

### 2. Create the model — `src/models/<ModelName>.js`
Follow the pattern used by existing models:
```js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MyModel extends Model {
    static associate(models) {
      // define associations here, e.g.:
      // MyModel.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  MyModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // ... fields matching migration columns ...
    },
    {
      sequelize,
      modelName: 'MyModel',
      tableName: '<table_name>',
      underscored: true, // maps camelCase to snake_case columns
    }
  );

  return MyModel;
};
```

### 3. Register model associations
`src/models/index.js` auto-loads all model files and calls `associate()`. Just define associations in the model's `static associate(models)` method — no changes needed to `index.js`.

### 4. Apply and verify
```bash
npm run db:migrate        # apply migration
# or for a full reset:
npm run db:reset
```

## Column type reference
`DataTypes.UUID`, `DataTypes.STRING(n)`, `DataTypes.TEXT`, `DataTypes.INTEGER`, `DataTypes.FLOAT`, `DataTypes.BOOLEAN`, `DataTypes.DATE`, `DataTypes.JSONB`, `DataTypes.ENUM('a','b')`

## Existing models and their associations
- `User` — has one `TutorProfile`, has one `StudentProfile`
- `TutorProfile` — belongs to `User`; has many `Enquiry` (as tutor), has many `TutorReview`
- `StudentProfile` — belongs to `User`
- `Enquiry` — belongs to `User` (student_id + tutor_id), relates to `TutorProfile`
- `TutorReview` — belongs to `TutorProfile`, belongs to `User` (student)

## Deliverables
1. Migration file in `migrations/`.
2. Model file in `src/models/`.
3. Associations defined in `static associate()`.
4. Instructions to apply the migration.
