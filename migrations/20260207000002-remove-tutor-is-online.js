'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = 'tutor_profiles';
    const describe = await queryInterface.describeTable(table);
    if (!describe.is_online) return;

    const indexName = 'tutor_profiles_is_online';
    try {
      await queryInterface.removeIndex(table, indexName);
    } catch (e) {
      // Index may not exist
    }
    await queryInterface.removeColumn(table, 'is_online');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tutor_profiles', 'is_online', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addIndex('tutor_profiles', ['is_online']);
  },
};
