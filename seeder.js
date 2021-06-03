const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


// run node seeder -i / node seeder -d


// load env vars
dotenv.config({path: './config/config.env'});

// load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const Review = require('./models/Review');

// connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// read json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// import into db
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await Review.create(reviews);

        console.log('Data imported'.bgGreen);
        process.exit();
    } catch(err) {
        console.log(err);
    }
};

// delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await Review.deleteMany();

        console.log('Data removed'.bgRed);
        process.exit();
    } catch(err) {
        console.log(err);
    }
};

if(process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
};