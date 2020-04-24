const Person = require('../models/personModel');
const base = require('./baseController');

exports.deleteMe = async (req, res, next) => {
    try {
        await Person.findByIdAndUpdate(req.person.id, {
            active: false
        });

        res.status(204).json({
            status: 'success',
            data: null
        });


    } catch (error) {
        next(error);
    }
};

exports.getAllPersons = base.getAll(Person);
exports.getPerson = base.getOne(Person);

// Don't update password on this 
exports.updatePerson = base.updateOne(Person);
exports.deletePerson = base.deleteOne(Person);