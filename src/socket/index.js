const { Order, Houses, User } = require('../../models');

const getOrders = async (data, type) => {
  try {
    const maxLimit = 20;

    let obj = {
      '$house.user_id$': data,
      status: 2,
    };
    if (type === 'email')
      obj = {
        '$house.owner.email$': data,
        status: 2,
      };

    let messages = await Order.findAll({
      where: obj,
      include: [
        {
          model: Houses,
          as: 'house',
          attributes: ['name'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['email', 'username'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['username', 'fullname'],
        },
      ],
      limit: maxLimit,
      attributes: ['id', 'status'],
      order: [['id', 'DESC']],
    });
    messages = JSON.parse(JSON.stringify(messages));
    console.log(messages.length, 'length notif', type);
    return messages;
  } catch (error) {
    console.log(error);
  }
};

module.exports.socketIo = (io) => {
  io.on('connection', async (socket) => {
    try {
      const { token } = socket;
      const email = socket.email;

      if (!token) {
        throw new Error('not authorized');
      }

      if (!email) {
        throw new Error('not authorized email');
      }

      socket.join(`user_${email}`);

      // console.log(email, 'nauk');
      socket.on('load-notification', async (data) => {
        console.log('load = ', data);

        io.to(`user_${data}`).emit(
          'new-notifications',
          await getOrders(data, 'email'),
        );
      });

      socket.on('send-notification', async (data) => {
        const { ownerId, email } = data;
        const resultOrders = await getOrders(ownerId, 'id');
        console.log('msg send = ', data);
        io.to(`user_${email}`).emit('new-notifications', resultOrders);
      });

      socket.on('disconnect', () => {
        console.log('disconnect');
        socket.disconnect();
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  io.use((socket, next) => {
    socket.email = socket.handshake.query.email;

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
