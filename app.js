const express = require("express");

//Create the express server
const app = express();

//set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));


// Define a route
app.get('/', (req, res) => {
    res.render('index', {title: 'Welcome to My Casino'});
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));