const express = require('express');
const dotEnv = require('dotenv');

// Load env vars
dotEnv.config({ path: './config/config.env' });

const app = express();

// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
