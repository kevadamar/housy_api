const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Roles } = require('../../models');
const { loginSchema, registerSchema } = require('../utils/schema/authSchema');

exports.me = async (req, res) => {
  try {
    let resultUser = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: {
        model: Roles,
        as: 'listAs',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['role_id', 'password', 'createdAt', 'updatedAt'],
      },
    });
    resultUser = JSON.parse(JSON.stringify(resultUser));

    resultUser = !resultUser.image_profile
      ? { ...resultUser }
      : {
          ...resultUser,
          image_profile: `${process.env.IMAGE_PATH}${resultUser.image_profile}`,
        };

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

//sign in
exports.signin = async (req, res) => {
  try {
    const payload = req.body;
    const { username, password } = payload;

    const { error } = loginSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    let resultUser = await User.findOne({
      where: {
        username,
      },
      include: {
        model: Roles,
        as: 'listAs',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'role_id'],
      },
    });
    if (!resultUser) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid Credentials',
      });
    }

    resultUser = JSON.parse(JSON.stringify(resultUser));

    const isValidPassword = bcrypt.compareSync(password, resultUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid Credentials',
      });
    }
    const token = jwt.sign(
      {
        id: resultUser.id,
        role: resultUser.listAs.name,
        email: resultUser.email,
      },
      process.env.SECRET_KEY,
    );

    res.status(200).json({
      status: 200,
      message: 'Successfully Login',
      data: {
        user: {
          fullname: resultUser.fullname,
          username: resultUser.username,
          email: resultUser.email,
          role: resultUser.listAs.name,
          image_profile: !resultUser.image_profile
            ? null
            : `${process.env.IMAGE_PATH}${resultUser.image_profile}`,
          phoneNumber: resultUser.phoneNumber,
          address: resultUser.address,
          gender: resultUser.gender,
        },
        token,
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

// sign up
exports.signup = async (req, res) => {
  try {
    let data = req.body;
    const { password, email } = data;

    const { error } = registerSchema.validate(data);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (checkEmail) {
      return res.status(400).send({
        status: 400,
        message: 'Email Already Registered',
      });
    }

    const SALT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT);
    data = {
      ...data,
      phone_number: parseInt(data.phone_number),
      password: hashedPassword,
    };

    console.log(typeof data.phone_number);

    const resultCreated = await User.create(data, {
      include: {
        model: Roles,
        as: 'listAs',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    });

    const resultFind = await User.findOne({
      where: {
        username: resultCreated.username,
      },
      include: {
        model: Roles,
        as: 'listAs',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    });

    const token = jwt.sign(
      { id: resultFind.id, role: resultFind.listAs.name },
      process.env.SECRET_KEY,
    );

    return res.status(200).json({
      status: 200,
      message: 'successfully created',
      data: { fullname: resultFind.fullname, token },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
