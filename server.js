const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
 const errorHandler = require('./middleware/error');


// Load evn variables
dotenv.config({path: './config/config.env'});

// connect to db
connectDB();
const bootcamps = require('./routes/bootcamps');
const app = express();
// Body parser
app.use(express.json());


// Dev logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

// Routes mounting
app.use('/api/v1/bootcamp/', bootcamps);
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