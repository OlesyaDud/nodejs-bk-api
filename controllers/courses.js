const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const course = require('../models/Course');


// @desc  Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/courses/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next)=> {
    let query;

    // if this route is hit: /api/v1/courses/:bootcampId/courses
    if(req.params.bootcampId) {
        query = Course.find({bootcamp: req.params.bootcampId});
    } else {
        // if this route is hit: /api/v1/courses
        query = Course.find();
    }

    const courses = await query;

    // sending response
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})