const express = require('express');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const dbConnection = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const errorHandler = require('./middleware/error');

// Load env vars
dotEnv.config({ path: './config/config.env' });

// Connect DB
dbConnection();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// File Uploading
app.use(fileUpload());

// Set security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/reviews', require('./routes/reviews'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
