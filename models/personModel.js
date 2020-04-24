const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const personSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please fill your fullName']
    },
    email: {
        type: String,
        required: [true, 'Please fill your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, ' Please provide a valid email']

    },
    password: {
        type: String,
        required: [true, 'Please fill your password'],
        minLength: 6,
        select: false

    },
    passwordConfirmation: {
        type: String,
        required: [true, 'Please fill your password confirm'],
        validate: {
            validator: function (el) {
                // "this" works only on create and save 
                return el === this.password;
            },
            message: 'Your password and confirmation password are not the same'
        }
    },
    role: {
        type: String,
        enum: ['admin','user'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
personSchema.pre('save', async function (next) {
    // check the password if it is modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hashing the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirmation field
    this.passwordConfirmation = undefined;
    next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
personSchema.methods.correctPassword = async function (typedPassword, originalPassword) {
    return await bcrypt.compare(typedPassword, originalPassword);
};

const person = mongoose.model('person', personSchema);
module.exports = person;