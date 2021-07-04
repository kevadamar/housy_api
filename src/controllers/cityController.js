const { Op } = require('sequelize');
const { City } = require('../../models');

exports.cities = async (req, res) => {
  try {
    const { q } = req.query;

    let resultCities;
    if (!q) {
      resultCities = await City.findAll();
    } else {
      resultCities = await City.findAll({
        where: {
          name: {
            [Op.substring]: q,
          },
        },
      });
    }
    return res.status(200).json({
      status: 200,
      message: 'Successfully',
      data: resultCities,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
