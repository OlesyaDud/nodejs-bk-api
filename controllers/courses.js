const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


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
        // populate() populates table with another table data
        // query = Course.find().populate('bootcamp');
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    };

    const courses = await query;

    // sending response
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});


// @desc  Get single course
// @route GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next)=> {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`, 404))
    }

    // sending response
    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc  Add a course for a spesific bootcamp 
// @route POST /api/v1/bootcamp/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next)=> {
    // getting bootcamp id, submitting it in a body field
    // bootcamp if refering to bootcamp row in a course model
    req.body.bootcamp = req.params.bootcampId
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`, 404))
    };

    // creating new course
    const course = await Course.create(req.body);

    // sending response
    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc  update course
// @route PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next)=> {
   
    let course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`, 404))
    };

    course = await Course.findByIdAndUpdate(req.params.id, req.body,  {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc  delete course
// @route PUT /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next)=> {
   
    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`, 404))
    };

  await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});