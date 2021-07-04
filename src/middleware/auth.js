const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    let header = req.header('Authorization');

    if (!header) {
      return res.status(401).send({
        status: 'failed',
        message: 'Unauthenticated!',
      });
    }

    let token = header.replace('Bearer ', '');

    const secretKey = process.env.SECRET_KEY;

    const verified = jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).send({
          status: 'failed',
          message: 'Invalid Credentials!',
        });
      } else {
        return decoded;
      }
    });

    req.idUser = verified.id;
    req.roleUser = verified.role

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 'failed',
      message: 'Internal Server Error',
    });
  }
};
