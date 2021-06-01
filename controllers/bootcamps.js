const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    // response
        res.status(200).json(res.commonResults);
    }
);

// @desc  Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            // return res.status(400).json({success: false});
            return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
        }
        
        res.status(200).json({success: true, data: bootcamp});
    });


// @desc  Create single bootcamp
// @route POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
     });
    });

// @desc  Update single bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access  Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,
            req.body, {new: true, runValidators: true});
    
            if(!bootcamp) {
                // return res.status(400).json({success: false});
                return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
            }

        res.status(201).json({
            success: true,
            data: bootcamp
         });
        });

// @desc  Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
    
            if(!bootcamp) {
                // return res.status(400).json({success: false});
                return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
            }

            // will trigger middleware to remove also courses
            bootcamp.remove();
            
        res.status(201).json({
            success: true,
            // sending back empty object
            data: {}
         });
        });


// @desc  Get b. within radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng=loc[0].longitude;

    // calc radius 
    // devide distance by radius of earth
    // Earth radius = 3, 963 mi --> 6, 378 km
    const radius = distance / 3963;
    const bootcamp = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        statuss: true,
        count: bootcamp.length,
        data: bootcamp
    });

});

// @desc  Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    // find bootcamp by id
    const bootcamp = await Bootcamp.findById(req.params.id);

    // check to see if there is a bootcamp
        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
        }
        // check if file is uploaded
        if(!req.files) {
            return next(new ErrorResponse('Please uploade a file', 400));
        }

        // console.log(req.files);

        const file = req.files.file;

        // make sure the image is a photo
        if(!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse('Please upload an image file', 400));
        }

        // check file size
        if(file.size > process.env.MAX_FILE_UPLOAD) {
            return next(new ErrorResponse(`File size must be less than ${process.env.MAX_FILE_UPLOAD}`, 400));
        }

        // create custom filename
        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if(err) {
                console.error(err);
                return next(new ErrorResponse('Problem with file upload', 500));
            }

            // insert file into db
            await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

            res.status(200).json({
                success: true,
                data: file.name
            })
        });
    });