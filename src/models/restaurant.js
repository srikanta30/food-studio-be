const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    cuisine: { type: String, required: true, trim: true },
    price: {type: Number, required: true, trim: true, minLength:1, maxLength:5},
}, {
    versionKey: false,
    timestamps: false
});

const Album = new mongoose.model('restaurants', restaurantSchema);

module.exports = Album;