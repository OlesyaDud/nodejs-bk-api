const express = require('express');
const {
   getCourses
} = require('../controllers/courses');

// object mergeParams:true is needed for the route coming from ex bootcamp into courses
const router = express.Router({mergeParams: true});

router.route('/').get(getCourses);

module.exports = router;