const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load evn variables
dotenv.config({path: './config/config.env'});

// connect to db
connectDB();

const bootcamps = require('./routes/bootcamps');

const app = express();


// Body parser
app.use(express.json());


// custom middleware
// app.use(logger);

// Dev logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}


// Routes mounting
app.use('/api/v1/bootcamp/', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`.bgBlue));

// handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);

    // close server and exist process
    server.close(() => process(1));
});