const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const colors = require('colors');
const fileupload = require('express-fileupload');
const morgan = require('morgan');
const connectDB = require('./config/db');
 const errorHandler = require('./middleware/error');


// Load evn variables
dotenv.config({path: './config/config.env'});

// connect to db
connectDB();
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');


const app = express();
// Body parser
app.use(express.json());
// Cookie-parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes mounting
app.use('/api/v1/bootcamp', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// middleware is executed in a linear order, so error handler has to be after bootcamps
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`.bgBlue));

// handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);

    // close server and exist process
    server.close(() => process(1));
});