const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async(req, res, next) => {
    let token;

    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer') ) 
    {
        token = req.headers.authorization.split(' ')[1];
    }
    // instead of headers will start using cookie to access token
    else if(req.cookies.token) {
        token = req.cookies.token
    }

    // make sure token exists ---in protected routes
    if(!token) {
        return next(new ErrorResponse('Not authorized', 401));
    }
    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized', 401));
    }
});

// grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorResponse('User role unauthorized', 403));
        }
        next();
    };
};