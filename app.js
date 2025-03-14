//node app.js - To Start

// Import necessary libraries
const cors = require('cors');
const express = require('express');
const { Client } = require('pg');
const path = require('path');

// Create an instance of the Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files (including index.html) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up PostgreSQL connection configuration
const client = new Client({
  user: 'postgres',        // Replace with your database username
  host: 'localhost',       // Replace with your database host (localhost for local machine)
  database: 'postgres',    // Replace with your database name
  password: 'admin',       // Replace with your database password
  port: 5432,              // Default PostgreSQL port
});

// Connect to PostgreSQL
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });

// Create an API route to fetch data from PostgreSQL database
app.get('/attendance', (req, res) => {
  const query = 'SELECT * FROM studentattendance';  // Adjust the table name if needed

  client.query(query)
    .then(result => {
      res.json(result.rows);  // Send the data as JSON response
    })
    .catch(err => {
      console.error('Error executing query', err.stack);
      res.status(500).send('Error fetching data');
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
