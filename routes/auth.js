const express = require('express');
const {
    register, 
    login, 
    getLoggedUser,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.get('/logged', protect, getLoggedUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;