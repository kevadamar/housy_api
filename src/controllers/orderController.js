const { Order, Houses, City, User, Roles, Booking } = require('../../models');
const { pathImage } = require('../utils/config');
const {
  createOrderSchema,
  editOrderSchema,
} = require('../utils/schema/orderSchema');

const fs = require('fs');
const { Op } = require('sequelize');

exports.getOrders = async (req, res) => {
  try {
    const { page } = req.query;

    const limit = page === undefined ? 20 : 5;
    const maxLimit = 50;
    const offset = page === undefined ? 0 : (page - 1) * limit;

    let resultOrders, countData;
    if (req.user.role === 'owner') {
      countData = await Order.findAll({
        where: {
          '$house.user_id$': req.user.id,
        },
        include: [
          {
            model: Houses,
            as: 'house',
            attributes: ['id'],
          },
        ],
        limit: maxLimit,
        attributes: ['id'],
      });
      resultOrders = await Order.findAll({
        where: {
          '$house.user_id$': req.user.id,
        },
        include: [
          {
            model: Houses,
            as: 'house',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
            },
            include: [
              {
                model: City,
                as: 'city',
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
              {
                model: User,
                as: 'owner',
                attributes: {
                  exclude: [
                    'createdAt',
                    'updatedAt',
                    'user_id',
                    'role_id',
                    'password',
                  ],
                },
                include: {
                  model: Roles,
                  required: true,
                  as: 'listAs',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  },
                },
              },
            ],
          },
          {
            model: User,
            as: 'user',
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'user_id',
                'role_id',
                'password',
              ],
            },
            include: {
              model: Roles,
              required: true,
              as: 'listAs',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
          },
        ],
        attributes: {
          exclude: ['updatedAt', 'house_id', 'user_id'],
        },
        offset,
        limit,
        order: [['createdAt', 'DESC']],
      });
      console.log('owner');
    } else {
      // countData = await Order.findAll({
      //   where: {
      //     user_id: req.user.id,
      //   },
      //   limit: maxLimit,
      //   attributes: ['id'],
      // });
      resultOrders = await Order.findAll({
        where: {
          user_id: req.user.id,
        },
        include: [
          {
            model: Houses,
            as: 'house',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
            },
            include: [
              {
                model: City,
                as: 'city',
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
              {
                model: User,
                as: 'owner',
                attributes: {
                  exclude: [
                    'createdAt',
                    'updatedAt',
                    'user_id',
                    'role_id',
                    'password',
                  ],
                },
                include: {
                  model: Roles,
                  required: true,
                  as: 'listAs',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  },
                },
              },
            ],
          },
          {
            model: User,
            as: 'user',
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'user_id',
                'role_id',
                'password',
              ],
            },
            include: {
              model: Roles,
              required: true,
              as: 'listAs',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
          },
        ],
        attributes: {
          exclude: ['updatedAt', 'house_id', 'user_id'],
        },
        limit,
        order: [['createdAt', 'DESC']],
      });
      console.log('tenant');
    }

    resultOrders = JSON.parse(JSON.stringify(resultOrders));
    resultOrders =
      resultOrders.length > 0
        ? resultOrders.map((order) => {
            return {
              ...order,
              attachment: `${process.env.IMAGE_PATH}${order.attachment}`,
              total: parseInt(order.total),
              house: {
                ...order.house,
                amenities: order.house?.amenities.split(','),
                image: `${process.env.IMAGE_PATH}${order.house?.image}`,
                price: parseInt(order.house?.price),
              },
            };
          })
        : [];
    res.status(200).json({
      status: 200,
      message: 'Successfully',
      countData: resultOrders.length,
      data: resultOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let resultOrder = await Order.findOne({
      where: { id },
      include: [
        {
          model: Houses,
          as: 'house',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
          },
          include: [
            {
              model: City,
              as: 'city',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
            {
              model: User,
              as: 'owner',
              attributes: {
                exclude: [
                  'createdAt',
                  'updatedAt',
                  'user_id',
                  'role_id',
                  'password',
                ],
              },
              include: {
                model: Roles,
                required: true,
                as: 'listAs',
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'user_id',
              'role_id',
              'password',
            ],
          },
          include: {
            model: Roles,
            required: true,
            as: 'listAs',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        },
      ],
      attributes: {
        exclude: ['updatedAt', 'house_id', 'user_id'],
      },
    });

    if (!resultOrder) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not Found!',
      });
    }

    resultOrder = JSON.parse(JSON.stringify(resultOrder));
    resultOrder = {
      ...resultOrder,
      attachment: `${process.env.IMAGE_PATH}${resultOrder.attachment}`,
      house: {
        ...resultOrder.house,
        amenities: resultOrder.house.amenities.split(','),
        image: `${process.env.IMAGE_PATH}${resultOrder.house.image}`,
      },
    };

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const { checkin, checkout, total, house_id, status } = req.body;
    const payload = { checkin, checkout, total, house_id, status };

    if (req.user.role === 'owner') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    const { error } = createOrderSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultDelete = await Booking.destroy({ where: { id: booking_id } });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Error Create!',
      });
    }

    const resultCreated = await Order.create({
      ...payload,
      user_id: req.user.id,
      attachment: req.files.imageFile[0].filename,
    });

    return res.status(201).json({
      status: 201,
      message: 'successfully created',
      data: resultCreated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.editOrder = async (req, res) => {
  try {
    const payload = req.body;
    const { id } = req.params;

    let resultOrder;

    if (req.user.role === 'tenant') {
      resultOrder = await Order.findOne({
        where: {
          [Op.and]: [
            {
              id,
              user_id: req.user.id,
            },
          ],
        },
      });
    } else {
      resultOrder = await Order.findOne({
        where: {
          id,
        },
      });
      console.log(req.user);
    }

    if (!resultOrder) {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    if (resultOrder.status !== 2 && req.user.role === 'tenant') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    const { error } = editOrderSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    const newPayload = !req.files.imageFile
      ? { ...payload }
      : {
          ...payload,
          image: req.files.imageFile[0].filename,
        };

    await Order.update(newPayload, {
      where: {
        id,
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

exports.updateStatusOrder = async (req, res) => {
  try {
    const payload = req.body;
    const { id } = req.params;

    if (req.user.role !== 'owner') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    let resultOrder = await Order.findOne({
      where: {
        id,
      },
    });

    if (!resultOrder) {
      return res.status(404).send({
        status: 404,
        message: 'Access Denied, Not found!',
      });
    }

    if (resultOrder.status !== 2 && req.user.role === 'tenant') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied, Cannot Access',
      });
    }

    const { error } = editOrderSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    await Order.update(payload, {
      where: {
        id,
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

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const resultOrder = await Order.findOne({
      where: {
        id,
      },
    });
    await Order.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
      raw: true,
    });

    const resultDelete = await Order.destroy({ where: { id } });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not Found!',
      });
    }

    const currentImage = `${pathImage}${resultOrder.attachment}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Deleted',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.bulkDeleteOrder = async (req, res) => {
  try {
    const { house_id } = req.params;

    let resultOrder = await Order.findAll({
      where: {
        house_id,
      },
    });
    await Order.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
      raw: true,
    });

    const resultDelete = await Order.destroy({
      where: {
        house_id,
      },
    });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not Found!',
      });
    }

    resultOrder = JSON.parse(JSON.stringify(resultOrder));

    resultOrder.map((order) => {
      const currentImage = `${pathImage}${order.attachment}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully Deleted',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
