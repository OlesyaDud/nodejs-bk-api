const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc  Register User
// @route POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async(req, res, next)=> {
    // what we need pulled from the body
    const {name, email, password, role} = req.body;

    // create user
    const user = await User.create({
        name, email, password, role
    });

    const token = user.getSignedJwt();

    res.status(200).json({success: true, token: token});
});


// @desc  Login User
// @route POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async(req, res, next)=> {
    // what we need pulled from the body
    const { email, password  } = req.body;
    // validate
    if(!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400))
    }

    const user = await User.findOne({email}).select('+password');
    if(!user) {
        return next(new ErrorResponse('Invalid credentials', 401))
    }

    // check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = user.getSignedJwt();

    res.status(200).json({success: true, token: token});
});