const { Op } = require('sequelize');
const { City } = require('../../models');

exports.cities = async (req, res) => {
  try {
    const { q } = req.query;

    let resultCities,
      countData = 0;
    if (!q) {
      const { count, rows } = await City.findAndCountAll({
        attributes: ['id', 'name'],
      });

      resultCities = rows;
      countData = count;
    } else {
      const { count, rows } = await City.findAndCountAll({
        where: {
          name: {
            [Op.substring]: q,
          },
        },
        attributes: ['id', 'name'],
      });

      resultCities = rows;
      countData = count;
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
