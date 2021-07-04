const { Houses, City } = require('../../models');
const { houseSchema, editHouseSchema } = require('../utils/schema/houseSchema');
const fs = require('fs')
const { pathImage } = require('../utils/config');

exports.getHouses = async (req, res) => {
  try {
    let resultHouses = await Houses.findAll({
      include: {
        model: City,
        as: 'city',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'city_id'],
      },
    });

    resultHouses =
      resultHouses.length > 0
        ? resultHouses.map((house) => {
            return {
              ...house.dataValues,
              amenities: house.amenities.split(','),
              image: `${process.env.IMAGE_PATH}${house.image}`,
            };
          })
        : [];

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultHouses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.getHouse = async (req, res) => {
  try {
    const { id } = req.params;
    let resultHouse = await Houses.findOne({
      where: {
        id,
      },
      include: {
        model: City,
        as: 'city',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'city_id'],
      },
    });

    if (!resultHouse) {
      return res.status(404).json({
        status: 404,
        message: 'House Not Found',
      });
    }

    resultHouse = {
      ...resultHouse.dataValues,
      amenities: resultHouse.amenities.split(','),
      image: `${process.env.IMAGE_PATH}${resultHouse.image}`,
    };

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultHouse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.createHouse = async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload);

    const { error } = houseSchema.validate(payload);

    if (error) {
      return res.send({
        status: 'failed',
        message: error.details[0].message,
      });
    }

    const resultCreated = await Houses.create({
      ...payload,
      image: req.files.imageFile[0].filename,
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

exports.editHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { error } = editHouseSchema.validate(payload);

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

    await Houses.update(newPayload, {
      where: {
        id,
      },
    });

    return res.status(200).json({
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

exports.deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const resultHouse = await Houses.findOne({
      where: {
        id,
      },
    });
    const resultDelete = await Houses.destroy({ where: { id } });
    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'House not found',
      });
    }

    const currentImage = `${pathImage}${resultHouse.image}`

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
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
