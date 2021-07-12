'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Houses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Houses.belongsTo(models.User, {
        as: 'owner',
        foreignKey: 'user_id',
      });

      Houses.belongsTo(models.City, {
        as: 'city',
        foreignKey: 'city_id',
      });

      Houses.hasMany(models.Order, {
        as: 'orders',
        foreignKey: 'house_id',
      });

      Houses.hasMany(models.Booking, {
        as: 'booking',
        foreignKey: 'house_id',
      });
    }
  }
  Houses.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.TEXT,
      price: DataTypes.STRING,
      description: DataTypes.TEXT,
      typeRent: DataTypes.STRING,
      amenities: DataTypes.STRING,
      image: DataTypes.STRING,
      imageFirst: DataTypes.STRING,
      imageSecond: DataTypes.STRING,
      imageThird: DataTypes.STRING,
      bedroom: DataTypes.INTEGER,
      bathroom: DataTypes.INTEGER,
      area: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Houses',
    },
  );
  return Houses;
};
