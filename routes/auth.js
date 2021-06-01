const express = require('express');
const {register, login, getLoggedUser} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.get('/logged', protect, getLoggedUser);

module.exports = router;