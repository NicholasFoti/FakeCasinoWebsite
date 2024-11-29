const express = require("express");
require("dotenv").config();
const path = require('path');

//Create the express server
const app = express();

//set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Define a route
app.get('/', (req, res) => {
    res.render('index', {title: 'Welcome to My Casino'});
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));