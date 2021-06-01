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

router.route('/')
.get(commonResults(Courses, {
      path: 'bootcamp',
      select: 'name description'
}), getCourses)
.post(addCourse);

router.route('/:id')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse);

module.exports = router;