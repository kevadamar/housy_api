'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Roles, {
        as: 'listAs',
        foreignKey: 'role_id',
      });

      User.hasMany(models.Houses, {
        as: 'houses',
        foreignKey: 'user_id',
      });

      User.hasMany(models.Order, {
        as: 'orders',
        foreignKey: 'user_id',
      });

      User.hasMany(models.Booking, {
        as: 'booking',
        foreignKey: 'user_id',
      });
    }
  }
  User.init(
    {
      fullname: DataTypes.STRING,
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      gender: DataTypes.STRING,
      image_profile: DataTypes.STRING,
      phone_number: DataTypes.BIGINT,
      address: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    },
  );
  return User;
};
