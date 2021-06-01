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

        sendTokenResponse(user, 200, res);

    // const token = user.getSignedJwt();
    // res.status(200).json({success: true, token: token});
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

   sendTokenResponse(user, 200, res);
});

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwt();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000),
        httpOnly: true
    };

    // when in production swill change cookie flag secure or https
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({success: true, token})
};

// @desc  get current logged user
// @route POST /api/v1/auth/login
// @access  Private
exports.getLoggedUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})