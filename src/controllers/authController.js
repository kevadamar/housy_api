const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Roles } = require('../../models');
const { loginSchema, registerSchema } = require('../utils/schema/authSchema');

exports.signin = async (req, res) => {
  try {
    const payload = req.body;
    const { username, password } = payload;

    const { error } = loginSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details[0].message,
      });
    }

    const resultUser = await User.findOne({
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
    });
    if (!resultUser) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid Credentials',
      });
    }

    const isValidPassword = bcrypt.compareSync(password, resultUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid Credentials',
      });
    }
    console.log(resultUser.listAs.name);
    const token = jwt.sign(
      { id: resultUser.id, role: resultUser.listAs.name },
      process.env.SECRET_KEY,
    );

    res.status(200).json({
      status: 200,
      message: 'Successfully Login',
      data: {
        fullname: resultUser.fullname,
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

exports.signup = async (req, res) => {
  try {
    const data = req.body;
    const { password, email } = data;

    const { error } = registerSchema.validate(data);

    if (error) {
      return res.send({
        status: 'failed',
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
        status: 'failed',
        message: 'Email Already Registered',
      });
    }

    const SALT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT);

    const resultCreated = await User.create({
      ...data,
      password: hashedPassword,
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
