const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const Person = require('../models/personModel');
const ApiError = require('../utils/apiError');


const createToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        // 1) check if email and password exist
        if (!email || !password) {
            return next(new ApiError(404, 'fail', 'Please provide email or password'), req, res, next);
        }

        // 2) check if person exist and password is correct
        const person = await Person.findOne({
            email
        }).select('+password');

        if (!person || !await person.correctPassword(password, person.password)) {
            return next(new ApiError(401, 'fail', 'Email or Password is wrong'), req, res, next);
        }

        // 3) All correct, send jwt to client
        const token = createToken(person.id);

        // Remove the password from the output 
        person.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                person
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    try {
        const person = await Person.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role,
        });

        const token = createToken(person.id);

        person.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: {
                person
            }
        });

    } catch (err) {
        next(err);
    }

};

exports.protect = async (req, res, next) => {
    try {
        // 1) check if the token is there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new ApiError(401, 'fail', 'You are not logged in! Please login in to continue'), req, res, next);
        }


        // 2) Verify token 
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) check if the person is exist (not deleted)
        const person = await Person.findById(decode.id);
        if (!person) {
            return next(new ApiError(401, 'fail', 'This person is no longer exist'), req, res, next);
        }

        req.person = person;
        next();

    } catch (err) {
        next(err);
    }
};

// Authorization check if the person have rights to do this action
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.person.role)) {
            return next(new ApiError(403, 'fail', 'You are not allowed to do this action'), req, res, next);
        }
        next();
    };
};