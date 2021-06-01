const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc  Register User
// @route GET /api/v1/auth/register
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