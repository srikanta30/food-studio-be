const mongoose = require('mongoose');
require('dotenv').config();

const connect = () => {
    console.log("Database Connected!");
    return mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bvbll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
}

module.exports = connect;