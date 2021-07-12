'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Order.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });

      Order.belongsTo(models.Houses, {
        as: 'house',
        foreignKey: 'house_id',
      });
    }
  }
  Order.init(
    {
      checkin: DataTypes.DATEONLY,
      checkout: DataTypes.DATEONLY,
      total: DataTypes.STRING,
      status: DataTypes.INTEGER,
      attachment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
    },
  );
  return Order;
};
