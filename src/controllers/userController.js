const bcrypt = require('bcrypt');
const { User, Roles } = require('../../models');
const fs = require('fs');
const { pathImage } = require('../utils/config');
const { passwordSchema } = require('../utils/schema/userSchema');

exports.users = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Roles,
        as: 'listAs',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
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
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    let payload = req.body;

    //handle photo profile
    if (req.files.imageFile) {
      const { image_profile } = await User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: ['image_profile'],
      });

      const currentImage = `${pathImage}${image_profile}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      payload = { ...payload, image_profile: req.files.imageFile[0].filename };
    }

    await User.update(payload, {
      where: {
        id: req.user.id,
      },
    });

    res.status(200).json({
      status: 200,
      message: 'successfully updated',
      data: {
        image_profile: `${process.env.IMAGE_PATH}${payload.image_profile}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let payload = req.body;

    const { error } = passwordSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    //handle changed password
    if (payload.password) {
      const SALT = 10;
      const hashedPassword = await bcrypt.hash(payload.password, SALT);
      payload = { ...payload, password: hashedPassword };
    }

    await User.update(payload, {
      where: {
        id: req.user.id,
      },
    });

    res.status(200).json({
      status: 200,
      message: 'successfully updated',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
