const express = require('express');
const {
   getCourses,
   getCourse,
   addCourse,
   updateCourse,
   deleteCourse
} = require('../controllers/courses');
const commonResults = require('../middleware/commonResults');
const Courses = require('../models/Course');


// object mergeParams:true is needed for the route coming from ex bootcamp into courses
const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
.get(commonResults(Courses, {
      path: 'bootcamp',
      select: 'name description'
}), getCourses)
.post(protect, authorize('publisher', 'admin'), addCourse);

router.route('/:id')
.get(getCourse)
.put(protect, authorize('publisher', 'admin'), updateCourse)
.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;