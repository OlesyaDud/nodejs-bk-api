const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendemails');
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

// @desc  get current logged user
// @route POST /api/v1/auth/logged
// @access  Private
exports.getLoggedUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc  update user details(name and email only)
// @route PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate);

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc  update password
// @route PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // check current password
    // await because matchPassword in a model is a Promise
    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrec', 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc  forgot password
// @route POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new ErrorResponse('No user found', 404));
    }
       // get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    // create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you or someone else requested password reset. Please make a PUT request to: \n\n ${resetUrl}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });
        res.status(200).json({success: true, data: 'Email sent'});
    } catch (error) {
        console.log(error);
        user.getResetPasswordToken = undefined;
        user.getResetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});
        return next(new ErrorResponse('Email could not be sent', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc  reset password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
   
});

// helper function
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