const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const authController = require('../controllers/authController');


router.post('/login', authController.login);
router.post('/signup', authController.signup);

// Protect all routes after this middleware
router.use(authController.protect);

router.delete('/deleteMe', personController.deleteMe);

// Only admin have permission to access for the below APIs 
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(personController.getAllPersons);


router
    .route('/:id')
    .get(personController.getPerson)
    .patch(personController.updatePerson)
    .delete(personController.deletePerson);

module.exports = router;