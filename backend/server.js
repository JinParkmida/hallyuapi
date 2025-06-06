const express = require('express');
const app = require('./app');

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

// NOTE - run 'nodemon server' to start server (live update) or node server.js
const PORT = process.env.PORT || 12000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, function () {
  console.log(`Server is running on ${HOST}:${PORT}`);
  console.log(`API Documentation: http://${HOST}:${PORT}/api/docs`);
  console.log(`API v2 Base URL: http://${HOST}:${PORT}/api/v2`);
});
