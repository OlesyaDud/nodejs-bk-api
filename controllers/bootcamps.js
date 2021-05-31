const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access  Public
// exports.getBootcamps = async (req, res, next) => {
//     try {
//         const bootcamps = await Bootcamp.find();

//         res.status(200).json({
//             success: true, 
//             data: bootcamps, 
//             count: bootcamps.length });
//     } catch (error) {
//         res.status(400).json({success: false});
//     };
// };
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({
            success: true, 
            data: bootcamps, 
            count: bootcamps.length });
    }
);

// @desc  Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access  Public
// exports.getBootcamp = async (req, res, next) => {
//     try {
//         const bootcamp = await Bootcamp.findById(req.params.id);

//         if(!bootcamp) {
//             // return res.status(400).json({success: false});
//             return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
//         }
        
//         res.status(200).json({success: true, data: bootcamp});
//     } catch (error) {
//         // res.status(400).json({success: false});
//         // next(error) goes to custom error handler
//         // next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
//         next(error);
//     };
// };
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
// exports.createBootcamp = async (req, res, next) => {
//     try {
//     const bootcamp = await Bootcamp.create(req.body);

//     res.status(201).json({
//         success: true,
//         data: bootcamp
//      });

//     } catch (error) {
//         // res.status(400).json({success: false});
//         next(error);
//     }
// };
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
// exports.updateBootcamp = async (req, res, next) => {
//     try {
//         const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,
//             req.body, {new: true, runValidators: true});
    
//             if(!bootcamp) {
//                 // return res.status(400).json({success: false});
//                 return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
//             }

//         res.status(201).json({
//             success: true,
//             data: bootcamp
//          });
    
//         } catch (error) {
//             // res.status(400).json({success: false});
//             next(error);
//         }
// };
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
// exports.deleteBootcamp = async (req, res, next) => {
//     // res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`});
//     try {
//         const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
//             if(!bootcamp) {
//                 // return res.status(400).json({success: false});
//                 return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
//             }
            
//         res.status(201).json({
//             success: true,
//             // sending back empty object
//             data: {}
//          });
    
//         } catch (error) {
//             // res.status(400).json({success: false});
//             next(error);
//         }
// };
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
            if(!bootcamp) {
                // return res.status(400).json({success: false});
                return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
            }
            
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