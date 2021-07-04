const router = require('express').Router();

// Controller
const { signin, signup } = require('../controllers/authController');
const { cities } = require('../controllers/cityController');
const { getHouses, getHouse, createHouse,deleteHouse, editHouse } = require('../controllers/houseController');
const { getRoles, createRole } = require('../controllers/roleController');
const { users, deleteUser } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { uploadFile } = require('../middleware/uploadFile');

// Endpoint

// auth
router.post('/signin', signin);
router.post('/signup', signup);

// User
router.get('/users', auth, users);
router.delete('/user/:id', auth, deleteUser);

// houses
router.get('/houses', getHouses);
router.get('/house/:id', getHouse);
router.post('/house', auth,uploadFile("imageFile"), createHouse);
router.patch('/house/:id', auth,uploadFile("imageFile"), editHouse);
router.delete('/house/:id', auth, deleteHouse);

// cities
router.get('/cities', cities);

// roles
router.get('/roles', getRoles);
router.post('/role', createRole);

module.exports = router;
