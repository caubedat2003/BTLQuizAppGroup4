const express = require('express');
const cors = require('cors');
require("dotenv").config();

console.log(process.env.MONGO_URL);
console.log(process.env.PORT);
const app = express();
const dbConfig = require('./config/dbConfig');

const usersRoute = require('./routes/usersRoute');
const examsRoute = require('./routes/examsRoute');
const reportsRoute = require('./routes/reportsRoute');

app.use(express.json());
app.use('/api/users', usersRoute);
app.use('/api/exams', examsRoute);
app.use('/api/reports', reportsRoute);


const port = process.env.PORT || 5000;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        // Respond to preflight requests
        res.sendStatus(200);
    } else {
        // Pass control to the next middleware
        next();
    }
    next();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});