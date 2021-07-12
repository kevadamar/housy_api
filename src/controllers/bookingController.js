const { Booking, Houses, City, User, Roles } = require('../../models');
const { pathImage } = require('../utils/config');
const {
  createBookingSchema,
  editBookingSchema,
} = require('../utils/schema/bookingSchema');

const fs = require('fs');
const { Op } = require('sequelize');

exports.getBookings = async (req, res) => {
  try {
    let resultBookings = await Booking.findAll({
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
      order: [['updatedAt', 'DESC']],
    });

    resultBookings = JSON.parse(JSON.stringify(resultBookings));
    resultBookings =
      resultBookings.length > 0
        ? resultBookings.map((booking) => {
            let amenities = booking.house?.amenities.split(',');

            return {
              ...booking,
              total: parseInt(booking.total),
              house: {
                ...booking.house,
                amenities,
                price: parseInt(booking.house?.price),
              },
            };
          })
        : [];
    res.status(200).json({
      status: 200,
      message: 'Successfully',
      countData: resultBookings.length,
      data: resultBookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let resultBooking = await Booking.findOne({
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
        exclude: ['createdAt', 'updatedAt', 'house_id', 'user_id'],
      },
    });

    if (!resultBooking) {
      return res.status(404).json({
        status: 404,
        message: 'Booking Not Found!',
      });
    }

    resultBooking = JSON.parse(JSON.stringify(resultBooking));
    resultBooking = {
      ...resultBooking,
      attachment: `${process.env.IMAGE_PATH}${resultBooking.attachment}`,
      house: {
        ...resultBooking.house,
        amenities: resultBooking.house.amenities?.split(','),
        image: `${process.env.IMAGE_PATH}${resultBooking.house.image}`,
      },
    };

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const payload = req.body;

    if (req.user.role === 'owner') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    const { error } = createBookingSchema.validate(payload);

    console.log(error);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultCreated = await Booking.create({
      ...payload,
      checkin: new Date(payload.checkin).setDate(
        new Date(payload.checkin).getDate() + 1,
      ),
      checkout: new Date(payload.checkout).setDate(
        new Date(payload.checkout).getDate() + 1,
      ),
      user_id: req.user.id,
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

exports.editBooking = async (req, res) => {
  try {
    const payload = req.body;
    const { id } = req.params;

    let resultBooking;

    if (req.user.role === 'tenant') {
      resultBooking = await Booking.findOne({
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
      resultBooking = await Booking.findOne({
        where: {
          id,
        },
      });
    }

    if (!resultBooking) {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    if (resultBooking.status !== 2 && req.user.role === 'tenant') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    const { error } = editBookingSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    await Booking.update(payload, {
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

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const resultDelete = await Booking.destroy({ where: { id } });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Booking Not Found!',
      });
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
