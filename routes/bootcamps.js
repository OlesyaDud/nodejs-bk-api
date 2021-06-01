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


// incluse other resource routers
const courseRouter = require('./courses');

// initializing router
const router = express.Router();

// re-route into other resource routers
// if :bootcampId/courses will be param, it will pass to course router
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);

router.route('/')
.get(commonResults(Bootcamp,'courses'), getBootcamps)
.post(createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);


module.exports = router;