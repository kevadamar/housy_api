const { Houses, City, User, Roles } = require('../../models');
const { houseSchema, editHouseSchema } = require('../utils/schema/houseSchema');
const fs = require('fs');
const { pathImage } = require('../utils/config');

exports.getHousesByOwner = async (req, res) => {
  try {
    const { page } = req.query;

    const limit = page === undefined ? 20 : 5;
    const offset = page === undefined ? 0 : (page - 1) * limit;

    let countData = await Houses.findAll({
      where: {
        user_id: req.user.id,
      },
      attributes: ['id'],
    });
    let resultHouses = await Houses.findAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: City,
          required: true,
          as: 'city',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          model: User,
          required: true,
          as: 'owner',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'role_id', 'password'],
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
        exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
      },
      offset,
      limit,
      order: [['updatedAt', 'DESC']],
    });

    countData = JSON.parse(JSON.stringify(countData)).length;
    resultHouses = JSON.parse(JSON.stringify(resultHouses));

    resultHouses =
      resultHouses.length > 0
        ? resultHouses.map((house) => {
            return {
              ...house,
              amenities: house.amenities.split(','),
              image: `${process.env.IMAGE_PATH}${house.image}`,
              imageFirst: !house.imageFirst
                ? null
                : `${process.env.IMAGE_PATH}${house.imageFirst}`,
              imageSecond: !house.imageSecond
                ? null
                : `${process.env.IMAGE_PATH}${house.imageSecond}`,
              imageThird: !house.imageThird
                ? null
                : `${process.env.IMAGE_PATH}${house.imageThird}`,
            };
          })
        : [];

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      countData: countData,
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

exports.getHouses = async (req, res) => {
  try {
    const { typeRent, price, bedroom, bathroom, amenities, city } = req.query;

    let resultHouses = await Houses.findAll({
      include: [
        {
          model: City,
          required: true,
          as: 'city',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          model: User,
          required: true,
          as: 'owner',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'role_id', 'password'],
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
        exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
      },
      order: [['updatedAt', 'DESC']],
    });

    resultHouses = JSON.parse(JSON.stringify(resultHouses));

    resultHouses =
      resultHouses.length > 0
        ? resultHouses.map((house) => {
            return {
              ...house,
              amenities: house.amenities.split(','),
              image: `${process.env.IMAGE_PATH}${house.image}`,
              imageFirst: !house.imageFirst
                ? null
                : `${process.env.IMAGE_PATH}${house.imageFirst}`,
              imageSecond: !house.imageSecond
                ? null
                : `${process.env.IMAGE_PATH}${house.imageSecond}`,
              imageThird: !house.imageThird
                ? null
                : `${process.env.IMAGE_PATH}${house.imageThird}`,
            };
          })
        : [];

    if (typeRent) {
      resultHouses = resultHouses.filter(
        (house) => house.typeRent === typeRent,
      );
    }

    if (price) {
      resultHouses = resultHouses.filter(
        (house) => house.price <= parseInt(price),
      );
    }

    if (bedroom) {
      resultHouses = resultHouses.filter(
        (house) => house.bedroom === parseInt(bedroom),
      );
    }

    if (bathroom) {
      resultHouses = resultHouses.filter(
        (house) => house.bathroom === parseInt(bathroom),
      );
    }

    if (amenities) {
      resultHouses = resultHouses.filter((house) =>
        house.amenities.includes(amenities),
      );
    }

    if (city) {
      resultHouses = resultHouses.filter(
        (house) =>
          house.city.name.toLowerCase().includes(city.toLowerCase()) ||
          house.address.toLowerCase().includes(city.toLowerCase()),
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully',
      countData: resultHouses.length,
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
      include: [
        {
          model: City,
          as: 'city',
          required: true,
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          model: User,
          required: true,
          as: 'owner',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'role_id', 'password'],
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
        exclude: ['createdAt', 'updatedAt', 'city_id', 'user_id'],
      },
    });

    if (!resultHouse) {
      return res.status(404).json({
        status: 404,
        message: 'House Not Found',
      });
    }

    resultHouse = JSON.parse(JSON.stringify(resultHouse));
    resultHouse = {
      ...resultHouse,
      amenities: resultHouse.amenities.split(','),
      image: `${process.env.IMAGE_PATH}${resultHouse.image}`,
      imageFirst: !resultHouse.imageFirst
        ? null
        : `${process.env.IMAGE_PATH}${resultHouse.imageFirst}`,
      imageSecond: !resultHouse.imageSecond
        ? null
        : `${process.env.IMAGE_PATH}${resultHouse.imageSecond}`,
      imageThird: !resultHouse.imageThird
        ? null
        : `${process.env.IMAGE_PATH}${resultHouse.imageThird}`,
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
    const { error } = houseSchema.validate(payload);
    let imagePayload = {
      imageFirst: null,
      imageSecond: null,
      imageThird: null,
    };

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    if (req.files.imageFile[1]) {
      imagePayload = {
        ...imagePayload,
        imageFirst: req.files.imageFile[1].filename,
      };
    }

    if (req.files.imageFile[2]) {
      imagePayload = {
        ...imagePayload,
        imageSecond: req.files.imageFile[2].filename,
      };
    }

    if (req.files.imageFile[3]) {
      imagePayload = {
        ...imagePayload,
        imageThird: req.files.imageFile[3].filename,
      };
    }
    // console.log(payload)

    const resultCreated = await Houses.create({
      ...payload,
      ...imagePayload,
      image: req.files.imageFile[0].filename,
      user_id: req.user.id,
    });

    return res.status(201).json({
      status: 201,
      message: 'successfully created',
      data: resultCreated,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};

exports.editHouse = async (req, res) => {
  try {
    const { id } = req.params;
    let payload = req.body;

    const { error } = editHouseSchema.validate(payload);

    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    //handle if image changed
    if (req.files.imageFile) {
      const { image } = await Houses.findOne({
        where: {
          id,
        },
        attributes: ['image'],
      });
      const currentImage = `${pathImage}${image}`;
      console.log(`currtenImage`, currentImage);
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      payload = { ...payload, image: req.files.imageFile[0].filename };
    }

    const resultUpdated = await Houses.update(payload, {
      where: {
        id,
      },
    });

    if (!resultUpdated[0]) {
      return res.status(404).json({
        status: 404,
        message: 'House not found',
      });
    }

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

    await Houses.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
      raw: true,
    });

    const resultDelete = await Houses.destroy({ where: { id } });
    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'House not found',
      });
    }

    const firstImage = `${pathImage}${resultHouse.image}`;
    const secondImage = `${pathImage}${resultHouse.imageFirst}`;
    const thirdImage = `${pathImage}${resultHouse.imageSecond}`;
    const fourthImage = `${pathImage}${resultHouse.imageThird}`;

    if (fs.existsSync(firstImage)) {
      fs.unlinkSync(firstImage);
    }

    if (fs.existsSync(secondImage)) {
      fs.unlinkSync(secondImage);
    }

    if (fs.existsSync(thirdImage)) {
      fs.unlinkSync(thirdImage);
    }

    if (fs.existsSync(fourthImage)) {
      fs.unlinkSync(fourthImage);
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
