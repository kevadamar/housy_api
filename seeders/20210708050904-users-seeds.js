'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        fullname: 'Owner Sakti',
        username: 'owner',
        email: 'owner@gmail.com',
        password:
          '$2b$10$BgavYsAap0YsuxjQCymVv.icp76/qx6Wf6nzkWCqXYiaL2sX7QOHu',
        role_id: 1,
        gender: 'female',
        phone_number: '835546776',
        address: 'Jl. Gatot Subroto no.20',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullname: 'user biasa aja 1',
        username: 'user1',
        email: 'user1@gmail.com',
        password:
          '$2b$10$8fMH9QbNYWmxxL4KK/b4RuLSXE5mU2hsxdYWCH68BFwlO8QnXEV52',
        role_id: 2,
        gender: 'male',
        phone_number: '8688556945',
        address: 'Jl. Jagakarsa no.20',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
