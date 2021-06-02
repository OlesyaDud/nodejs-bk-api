const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


// @desc  Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/courses/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next)=> {

    // if this route is hit: /api/v1/courses/:bootcampId/courses
    if(req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId});

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })

        } else {
            // can implement pagination, sorting etc...
            // http://localhost:5000/api/v1/courses?select=title
            // http://localhost:5000/api/v1/courses?page=2&limit=2
            res.status(200).json(res.commonResults);
        }
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
    // bootcamp/user if refering to bootcamp/user in a course model
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;


    // looking bootcamp by id, if not there-throwing error, if there is a bootcamp, then creating a course for that bootcamp 
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`, 404))
    };
    // before we create, making sure that bootcamp ownder is the user thats logged in
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to add acourse to this bootcamp`, 401));
     }
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

    // if user is equal to the logged in user and not an admin
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to update course`, 401));
     }

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

     // if user is equal to the logged in user and not an admin
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to delete course`, 401));
     }

    await course.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
});