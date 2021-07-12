'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Booking.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });

      Booking.belongsTo(models.Houses, {
        as: 'house',
        foreignKey: 'house_id',
      });
    }
  }
  Booking.init(
    {
      checkin: DataTypes.DATE,
      checkout: DataTypes.DATE,
      total: DataTypes.STRING,
      status: DataTypes.INTEGER,
      house_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
    },
  );
  return Booking;
};
