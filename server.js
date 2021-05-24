const express = require('express');
const dotenv = require('dotenv');
const bootcamps = require('./routes/bootcamps');
// const logger = require('./middleware/logger');
const morgan = require('morgan');


// Load evn variables
dotenv.config({path: './config/config.env'});

const app = express();

// custom middleware
// app.use(logger);

// Dev logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}


// Routes mounting
app.use('/api/v1/bootcamp/', bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`));