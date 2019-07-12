const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const pwGenerate = require('generate-password');
const nodemailer = require('nodemailer');

const ensureAdmin = require('../config/auth').ensureAdmin;
const EmailAuth = require('../config/keys').EmailAuth;

// User model
const User = require('../models/User');

// Show user list
router.get('/user-list', ensureAdmin, (req, res) => User.find({})
    .then(users => {
        res.render('dashboard', {
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
    if (!req.body.nameForm || !req.body.accountTypeForm || (req.body.accountTypeForm == 'Customer' && !req.body.valetSummaryURLForm) || (req.body.accountTypeForm == 'Employee' && !req.body.positionForm)) {
        req.flash('error_msg', 'User has not been updated, fill in all fields');
        res.redirect('/admin/user-list');
    } else {
        User.updateOne({ _id: req.body.editUserID }, {
            name: req.body.nameForm,
            accountType: req.body.accountTypeForm,
            valetSummaryURL: req.body.valetSummaryURLForm,
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
router.post('/reset-password', ensureAdmin, (req, res) => {
    const { resetPasswordUserID, resetPasswordEmail } = req.body;
    var tempPassword = pwGenerate.generate({
        length: 10,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true
    });
    // Hash Password
    bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(tempPassword, salt, (err, hash) => {
            if (err) throw err;
            // Update user
            User.updateOne({ _id: resetPasswordUserID }, {
                password: hash,
                passwordReset: true
            }, function (err, dbres) {
                // `dbres.modifiedCount` contains the number of docs that MongoDB updated
                if (err) {
                    console.log(err);
                    req.flash('error_msg', 'An error occured');
                    res.redirect('/admin/user-list');
                } else {
                    // Send user notification email
                    var transporter = nodemailer.createTransport(EmailAuth);
                    transporter.sendMail({
                        from: EmailAuth.auth.user,
                        to: resetPasswordEmail,
                        subject: 'My AAP - Account Change',
                        text: `Your password has been reset by an administrator. Please use the temporary password to log in and you will be asked to reset it.\n\nTemporary password: ${tempPassword}`
                    }, function (error, info) {
                        if (error) {
                            console.log(error);
                            req.flash('error_msg', 'An error occured');
                            res.redirect('/admin/user-list');
                        } else {
                            console.log('Email sent: ' + info.response);
                            req.flash('success_msg', `User's password has been successfully reset. Email sent to : ${resetPasswordEmail}`);
                            res.redirect('/admin/user-list');
                        }
                    });
                }
            });
        })
    );
});

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