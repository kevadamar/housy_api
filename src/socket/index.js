const jwt = require('jsonwebtoken');
const { Order, Houses } = require('../../models');

const getOrders = async (id) => {
  try {
    let messages = await Order.findAll({
      where: {
        '$house.user_id$': id,
        status: 2,
      },
      include: [
        {
          model: Houses,
          as: 'house',
          attributes: ['name'],
        },
      ],
      attributes: ['id', 'status'],
    });
    messages = JSON.parse(JSON.stringify(messages));
    console.log(messages.length, 'length notif');
    return messages;
  } catch (error) {
    console.log(error);
  }
};

module.exports.socketIo = (io) => {
  io.on('connection', async (socket) => {
    const { token } = socket;

    if (!token) {
      throw new Error('not authorized');
    }
    const secretKey = process.env.SECRET_KEY;

    const verifiedJWT = jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        throw new Error('Invalid Credentials!');
      } else {
        return decoded;
      }
    });

    socket.on('load-notification', async (data) => {
      console.log('msg = ', data);
      io.emit('new-notifications', await getOrders(verifiedJWT.id));
    });

    socket.on('send-notification', async (data) => {
      const resultOrders = await getOrders(data);
      console.log('msg send = ', data);
      io.emit('new-notifications', resultOrders);
    });

    socket.on('disconnect', () => {
      console.log('disconnect');
      socket.disconnect();
    });
  });
  io.use((socket, next) => {
    if (socket.handshake.query.token) {
      const token = socket.handshake.query.token;
      socket.token = token;
      next();
    } else {
      console.log('error');
      const err = new Error('not authorized!');
      next(err);
    }
  });
};
