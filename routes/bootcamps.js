const express = require('express');
const {
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcamps, 
    getBootcamp,
    getBootcampsByRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');
const commonResults = require('../middleware/commonResults');
const Bootcamp = require('../models/Bootcamp');


// incluse other resource routers--get courses/reviews of a particular bootcamp
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// initializing router
const router = express.Router();

// protect routes
const {protect, authorize} = require('../middleware/auth');

// re-route into other resource routers
// if :bootcampId/courses will be param, it will pass to course router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);

router.route('/')
.get(commonResults(Bootcamp,'courses'), getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect,authorize('publisher', 'admin'), bootcampPhotoUpload);


module.exports = router;