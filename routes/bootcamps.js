const express = require('express');
const {
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcamps, 
    getBootcamp,
    getBootcampsByRadius
} = require('../controllers/bootcamps');

const router = express.Router();

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);

router.route('/')
.get(getBootcamps)
.post(createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp);



module.exports = router;