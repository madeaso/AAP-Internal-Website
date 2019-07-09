const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ensureAdmin = require('../config/auth').ensureAdmin;

// User model
const User = require('../models/User');

// Show user list
router.get('/user-list', ensureAdmin, (req, res) => User.find({})
    .then(users => {
        res.render('user-list', {
            activePage: 'user-list',
            name: req.user.name,
            email: req.user.email,
            accountType: req.user.accountType,
            list: users
        });
    }));
    
/* TO-DO
// Update a user's information
router.post('/update-user', ensureAdmin, (req, res) => {
    // Handle user update


    req.flash('success_msg', 'User has been successfully updated');
    res.redirect('/admin/user-list');
});

// Reset a user's password
router.post('/password-reset', ensureAdmin, (req, res) => {

    req.flash('success_msg', "User's password has been successfully reset. Email sent to : " + "email placeholder");
    res.redirect('/admin/user-list');
});

// Delete a user
*/

module.exports = router;