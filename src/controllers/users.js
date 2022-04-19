const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
require('dotenv').config();

const newToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET_KEY);
}

const { body, validationResult } = require('express-validator');

const User = require('../models/user');

router.post('/register',
    body('name')
        .notEmpty()
        .withMessage("User's name is required!"),
    body('email')
        .notEmpty()
        .withMessage("User's email is required!")
        .isEmail()
        .withMessage('Enter a valid email!'),
    body('password')
        .notEmpty()
        .withMessage('Password is required!')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
        .withMessage('Invalid Password Format!')
        .isLength({ min: 8 })
        .withMessage('Password should be 8-20 characters long!'),
        body('role')
        .notEmpty()
        .withMessage('Role is required!'),

    async (req, res) => {

        const errors = validationResult(req);

        let finalErrors = null;

        if (!errors.isEmpty()) {
            finalErrors = errors.array().map((error) => {
                return {
                    param: error.param,
                    message: error.msg
                };
            });
            return res.status(400).send({ error: finalErrors });
        }

        try {
            const userEmailCheck = await User.findOne({ email: req.body.email }).lean().exec();

            if (userEmailCheck) {
                return res.status(400).send({ error: "User with this Email already exists!" });
            }

            const user = await User.create(req.body);

            const token = newToken(user);

            const data = {
                token: token,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    id: user._id,
                }
            }

            return res.status(201).send({ data });

        } catch (err) {

            return res.status(400).send({ error: err});
        }
    }
)

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: { $eq: req.body.email }});

        if (!user) {
            return res.status(400).send({ error: 'Please check your Email Id or password!' });
        }

        let match = user.checkPassword(req.body.password);

        if (!match) {
            return res.status(400).send({ error: 'Please check your Email Id or password!' });
        }

        const token = newToken(user);

        const data = {
            token: token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                id: user._id,
            }
        }

        return res.status(200).send({ data });

    } catch (err) {
        return res.status(400).send({ error: err});
    }
})

router.get('/getuser', authenticate, async (req, res) => {
    try {
        const payload = {
            name: req.user.user.name,
            email: req.user.user.email,
            role: req.user.user.role,
            id: req.user.user._id,
        }
        return res.status(200).send({ user: payload });
    } catch (err) {
        return res.status(400).send({ error: err });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    try {

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        const payload = {
            name: user.name,
            email: user.email,
            role: user.role,
            id: user._id,
        }

        return res.status(200).send({ user: payload });

    } catch (err) {

        return res.status(400).send({ error: err });
    }
})


module.exports = router;