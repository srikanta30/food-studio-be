const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const router = express.Router();

const Restaurant = require('../models/restaurant');

router.get('/', async (req, res) => {
    try {

        let queryCuisines;
        const page = req.query.page || 1;
        const size = 20;

        if (req.query.cuisines) {
            queryCuisines = req.query.cuisines.split(',');
        }

        const offset = (page - 1) * size;

        const restaurantsCount = await Restaurant.find({}).countDocuments();
        const allRestaurants = await Restaurant.find({}).lean().exec();

        const cuisines = new Set();

        for (let i = 0; i < allRestaurants.length; i++) {
            cuisines.add(allRestaurants[i].cuisine);
        }

        queryCuisines = queryCuisines || [...cuisines];
        if (req.query.sort && queryCuisines) {
            const count = await Restaurant.find({ cuisine: { $in: [...queryCuisines] } }).countDocuments();

            const restaurants = await Restaurant.find({ cuisine: { $in: [...queryCuisines] } }).sort({ price: req.query.sort }).skip(offset).limit(size).lean().exec();

            let pages;

            if (queryCuisines.length === cuisines.size) {
                pages = Math.ceil(restaurantsCount / size);
            } else {
                pages = Math.ceil(count / size);
            }

            return res.status(200).send({ restaurants: restaurants, restaurantsCount: restaurantsCount, pages: pages, cuisines: [...cuisines] });
        } else if (queryCuisines.length === cuisines.size) {
            const count = await Restaurant.find({ cuisine: { $in: [...queryCuisines] } }).countDocuments();

            const restaurants = await Restaurant.find({}).skip(offset).limit(size).lean().exec();

            const pages = Math.ceil(count / size);

            return res.status(200).send({ restaurants: restaurants, restaurantsCount: restaurantsCount, pages: pages, cuisines: [...cuisines] });
        } else if (queryCuisines) {
            const count = await Restaurant.find({ cuisine: { $in: [...queryCuisines] } }).countDocuments();

            const restaurants = await Restaurant.find({ cuisine: { $in: [...queryCuisines] } }).skip(offset).limit(size).lean().exec();

            const pages = Math.ceil(count / size);

            return res.status(200).send({ restaurants: restaurants, restaurantsCount: restaurantsCount, pages: pages, cuisines: [...cuisines] });
        }

    } catch (err) {
        console.log("Error:", err);
        return res.status(400).send({ error: "Something went wrong!" });
    }
})


router.get('/:id', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ _id: req.params.id }).lean().exec();

        return res.status(200).send({ restaurants: restaurants });
    } catch (err) {

        return res.status(400).send({ error: "Something went wrong!" });
    }
})

router.get('/:search/search', async (req, res) => {
    try {

        const size = 20;

        const restaurants = await Restaurant.find({ $or: [{name: { $regex: req.query.s, $options: 'i' }}, {cuisine: { $regex: req.query.s, $options: 'i' }}, {place: { $regex: req.query.s, $options: 'i' }}]}).lean().exec();

        const pages = Math.ceil(restaurants.length / size);

        return res.status(200).send({ restaurants: restaurants, pages: pages });

    } catch (err) {

        return res.status(400).send({ error: "Something went wrong!" });
    }
})

router.post('/', authenticate, authorize("admin"), async (req, res) => {
    try {
        const payload = {
            ...req.body,
            user: req.user.user._id
        }

        const restaurant = await Restaurant.create(payload);

        return res.status(200).send({ restaurant: restaurant });
    } catch (err) {

        return res.status(400).send({ error: "Something went wrong!" });
    }
})

router.patch('/:id', authenticate, authorize("admin"), async (req, res) => {
    try {

        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        return res.status(200).send({ restaurant: restaurant });

    } catch (err) {


        return res.status(400).send({ error: 'Something went wrong!' });
    }
})

router.delete('/:id', authenticate, authorize("admin"), async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        return res.status(200).send({ restaurant });

    } catch (err) {


        return res.status(400).send({ error: 'Something went wrong!' });
    }
})

module.exports = router;