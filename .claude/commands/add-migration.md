Create a Sequelize migration and (if needed) update the matching model.

## Task
$ARGUMENTS

## Migration conventions

**Generate** a migration file stub via Sequelize CLI (then fill it in):
```bash
cd musictutorbe
npx sequelize-cli migration:generate --name <descriptive-kebab-case-name>
```
This creates `migrations/YYYYMMDDHHMMSS-<name>.js`.

**Template** — always implement both `up` and `down`:
```js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Example: add a column
    await queryInterface.addColumn('table_name', 'column_name', {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('table_name', 'column_name');
  },
};
```

## Common operations

| Operation | `up` | `down` |
|-----------|------|--------|
| Add column | `addColumn(table, col, def)` | `removeColumn(table, col)` |
| Remove column | `removeColumn(table, col)` | `addColumn(table, col, def)` |
| Create table | `createTable(name, cols)` | `dropTable(name)` |
| Add index | `addIndex(table, fields, opts)` | `removeIndex(table, fields)` |
| Change column type | `changeColumn(table, col, def)` | `changeColumn(table, col, originalDef)` |
| Rename column | `renameColumn(table, old, new)` | `renameColumn(table, new, old)` |

## Existing table names
- `users`
- `student_profiles`
- `tutor_profiles`
- `enquiries`
- `tutor_reviews`

## After writing the migration

1. If the change affects a model, update `src/models/<Model>.js` to match (add/remove fields, update types).
2. Run to apply:
   ```bash
   npm run db:migrate
   ```
3. To roll back:
   ```bash
   npm run db:migrate:undo
   ```
4. For a full reset with seeded test data:
   ```bash
   npm run db:reset
   ```

## Sequelize type reference
`STRING`, `TEXT`, `INTEGER`, `FLOAT`, `BOOLEAN`, `DATE`, `DATEONLY`, `JSONB`, `ENUM('val1','val2')`, `UUID`

## Deliverables
1. Migration file in `migrations/`.
2. Updated model file in `src/models/` if schema changed.
3. One-line description of what the migration does and how to reverse it.
