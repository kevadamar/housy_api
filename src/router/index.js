const router = require('express').Router();

// Controller
const { signin, signup, me } = require('../controllers/authController');
const {
  getBookings,
  getBooking,
  createBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { cities } = require('../controllers/cityController');
const {
  getHouses,
  getHouse,
  createHouse,
  deleteHouse,
  editHouse,
} = require('../controllers/houseController');
const {
  getOrders,
  getOrder,
  deleteOrder,
  createOrder,
  editOrder,
  updateStatusOrder,
} = require('../controllers/orderController');
const { getRoles, createRole } = require('../controllers/roleController');
const {
  users,
  deleteUser,
  updateUserProfile,
  updateUser,
} = require('../controllers/userController');
const { auth, ownerAccess } = require('../middleware/auth');
const { uploadFile } = require('../middleware/uploadFile');

// Endpoint

// auth
router.post('/signin', signin);
router.post('/signup', signup);
router.get('/auth/me', auth, me);

// User
router.get('/users', auth, users);
router.patch(
  '/user/update-photo',
  auth,
  uploadFile('imageFile'),
  updateUserProfile,
);
router.patch('/user/update', auth, updateUser);
router.delete('/user/:id', auth, deleteUser);

// houses
router.get('/houses', getHouses);
router.get('/house/:id', getHouse);
router.post('/house', auth, ownerAccess, uploadFile('imageFile'), createHouse);
router.patch(
  '/house/:id',
  auth,
  ownerAccess,
  uploadFile('imageFile'),
  editHouse,
);
router.delete('/house/:id', auth, ownerAccess, deleteHouse);

// orders / transaction
router.get('/orders', auth, getOrders);
router.get('/order/:id', auth, getOrder);
router.post('/order', auth, uploadFile('imageFile'), createOrder);
router.patch('/order/:id', auth, uploadFile('imageFile'), editOrder);
router.patch('/order/:id/status', auth, ownerAccess, updateStatusOrder);
router.delete('/order/:id', auth, ownerAccess, deleteOrder);

// booking
router.get('/bookings', auth, getBookings);
router.get('/booking/:id', auth, getBooking);
router.post('/booking', auth, createBooking);
router.delete('/booking/:id', auth, deleteBooking);

// cities
router.get('/cities', cities);

// roles
router.get('/roles', getRoles);
router.post('/role', createRole);

module.exports = router;
