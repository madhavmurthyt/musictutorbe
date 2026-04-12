'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'photo_data', {
      type: Sequelize.BLOB,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'photo_mime_type', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'photo_data');
    await queryInterface.removeColumn('users', 'photo_mime_type');
  },
};
