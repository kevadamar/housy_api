'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('houses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      typeRent: {
        type: Sequelize.STRING,
      },
      amenities: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      bedroom: {
        type: Sequelize.INTEGER,
      },
      bathroom: {
        type: Sequelize.INTEGER,
      },
      city_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('houses');
  },
};
