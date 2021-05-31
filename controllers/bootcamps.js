const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // filtering
    //http://localhost:5000/api/v1/bootcamp?careers[in]=Business
    //http://localhost:5000/api/v1/bootcamp?averageCost[gte]=10000&location.city=Boston
    let query;

    // making a copy of request.query
    const reqQuery = {...req.query};

    //  I do not want to match  a query as a field or fields to exclude
    const removeFields = ['select','sort', 'page', 'limit'];

    // loop over removeFields and delete them from reqQuery, in this case "select"
    // http://localhost:5000/api/v1/bootcamp?select=name
    removeFields.forEach(param => delete reqQuery[param]);
    // console.log(reqQuery);


    // json params as a querystr--creating query string
    let queryStr = JSON.stringify(reqQuery);

    // creating oprators to query-"greater than" etc
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`);
    // console.log(queryStr);

    // finding resource
    // + reverse populate- includes all fields of courses model
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // select fields
    // http://localhost:5000/api/v1/bootcamp?select=name,description
    // http://localhost:5000/api/v1/bootcamp?select=name,description, housing&housing=true
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    };

    // again for multiple coma separated fields
    // http://localhost:5000/api/v1/bootcamp?select=name,description, housing&sort=name
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else {
        query = query.sort('-createdAt')
    };

    // pagination
    // http://localhost:5000/api/v1/bootcamp?limit=2&select=name
    // page 2: http://localhost:5000/api/v1/bootcamp?page=2&limit=2&select=name
    // http://localhost:5000/api/v1/bootcamp?select=name&page=2
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);


    // executing query
    const bootcamps = await query;

    // pagination result
    const pagination = {};

    // setting next or previous page
    // http://localhost:5000/api/v1/bootcamp?page=4
    if(endIndex < total) {
        pagination.next = {
            page: page +1,
            limit
        }
    };

    if(startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    };

    // response
        res.status(200).json({
            success: true, 
            data: bootcamps, 
            count: bootcamps.length, 
            pagination });
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