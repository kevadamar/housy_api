const { Order, Houses, City } = require('../../models');
const { pathImage } = require('../utils/config');
const {
  createOrderSchema,
  editOrderSchema,
} = require('../utils/schema/orderSchema');

const fs = require('fs');

exports.getOrders = async (req, res) => {
  try {
    let resultOrders = await Order.findAll({
      include: {
        model: Houses,
        as: 'house',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'city_id'],
        },
        include: {
          model: City,
          as: 'city',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'house_id'],
      },
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully',
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
    const resultOrder = await Order.findOne({
      where: { id },
      include: {
        model: Houses,
        as: 'house',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'city_id'],
        },
        include: {
          model: City,
          as: 'city',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'house_id'],
      },
    });

    if (!resultOrder) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not Found!',
      });
    }

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
    const payload = req.body;

    const { error } = createOrderSchema.validate(payload);

    if (error) {
      return res.send({
        status: 'failed',
        message: error.details[0].message,
      });
    }

    const resultCreated = await Order.create({
      ...payload,
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

    const { error } = editOrderSchema.validate(payload);

    if (error) {
      return res.send({
        status: 'failed',
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

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const resultOrder = await Order.findOne({
      where: {
        id,
      },
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
