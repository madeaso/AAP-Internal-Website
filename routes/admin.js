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
            activePage: 'dashboard',
            activeModule: 'user-list',
            name: req.user.name,
            email: req.user.email,
            accountType: req.user.accountType,
            list: users
        });
    }));

// Update a user's information
router.post('/update-user', ensureAdmin, (req, res) => {
    if (!req.body.nameForm || !req.body.accountTypeForm || (req.body.accountTypeForm == 'Employee' && !req.body.positionForm)) {
        req.flash('error_msg', 'User has not been updated, fill in all fields');
        res.redirect('/admin/user-list');
    } else {
        User.updateOne({ _id: req.body.editUserID }, {
            name: req.body.nameForm,
            accountType: req.body.accountTypeForm,
            position: req.body.positionForm
        }, function (err, dbres) {
            // `dbres.modifiedCount` contains the number of docs that MongoDB updated
            if (err) {
                console.log(err);
                req.flash('error_msg', 'An error occured, user may not have been updated');
                res.redirect('/admin/user-list');
            } else {
                req.flash('success_msg', 'User has been successfully updated');
                res.redirect('/admin/user-list');
            }
        });
    }
});

// Reset a user's password
// router.post('/password-reset', ensureAdmin, (req, res) => {

//     req.flash('success_msg', "User's password has been successfully reset. Email sent to : " + "email placeholder");
//     res.redirect('/admin/user-list');
// });

// Delete a user
router.post('/delete-user', ensureAdmin, (req, res) => {
    User.deleteOne({ _id: req.body.deleteUserID }, function (err) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', `The user ${req.body.deleteEmail} has been deleted`);
            res.redirect('/admin/user-list');
        }
    });
});

module.exports = router;