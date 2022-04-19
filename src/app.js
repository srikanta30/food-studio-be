const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const { httpLogger } = require("./middlewares");

app.use(cors());
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    return res.status(200).json({message: "Welcome To Food Ordering App REST API!"})
})

const userController = require('./controllers/users');
app.use('/user', userController);

const restaurantController = require('./controllers/restaurant');
app.use('/restaurant', restaurantController);

module.exports = app;