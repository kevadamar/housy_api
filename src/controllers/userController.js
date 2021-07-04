const bcrypt = require('bcrypt');
const { User } = require('../../models');
const { registerSchema } = require('../utils/schema/authSchema');

exports.users = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password'],
      },
    });
    res.status(200).json({
      status: 200,
      message: 'successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status.json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const resultDelete = await User.destroy({ where: { id } });
    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      status: 200,
      message: 'successfully deleted',
    });
  } catch (error) {
    console.log(error);
    res.status.json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
