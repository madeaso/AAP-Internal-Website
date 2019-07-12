const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const pwGenerate = require('generate-password');
const nodemailer = require('nodemailer');

const ensureReset = require('../config/auth').ensureReset;
const ensureAdmin = require('../config/auth').ensureAdmin;
const EmailAuth = require('../config/keys').EmailAuth;

// User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        // Log the user out and allow them to login again
        req.logout();
        req.flash('success_msg', 'You have been logged out, you may now login again');
        res.redirect('/users/login');
    } else {
        res.render('login');
    }
});

// Register Page
router.get('/register', ensureAdmin, (req, res) => res.render('register', {
    activePage: 'register',
    email: req.user.email,
    accountType: req.user.accountType
}));

// Register Handle
router.post('/register', ensureAdmin, (req, res) => {
    const { nameForm, emailForm, accountTypeForm, valetSummaryURLForm, positionForm } = req.body;
    let errors = [];

    // Check required fields
    if (!nameForm || !emailForm || !accountTypeForm || (accountTypeForm == 'Customer' && !valetSummaryURLForm) || (accountTypeForm == 'Employee' && !positionForm)) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        res.render('register', {
            activePage: 'register',
            email: req.user.email,
            accountType: req.user.accountType,
            errors,
            nameForm,
            emailForm,
            accountTypeForm,
            valetSummaryURLForm,
            positionForm
        });
    } else {
        // Validation passed
        User.findOne({ email: emailForm })
            .then(user => {
                var tempPassword;
                if (user) {
                    // User exists
                    errors.push({ msg: 'This email is already registered' });
                    res.render('register', {
                        activePage: 'register',
                        email: req.user.email,
                        accountType: req.user.accountType,
                        errors,
                        nameForm,
                        emailForm,
                        accountTypeForm,
                        valetSummaryURLForm,
                        positionForm
                    });
                } else {
                    tempPassword = pwGenerate.generate({
                        length: 10,
                        numbers: true,
                        symbols: true,
                        excludeSimilarCharacters: true
                    });
                    const newUser = new User({
                        name: nameForm,
                        email: emailForm,
                        accountType: accountTypeForm,
                        valetSummaryURL: valetSummaryURLForm,
                        position: positionForm,
                        password: tempPassword
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then(user => {
                                    // Send user notification email
                                    var transporter = nodemailer.createTransport(EmailAuth);
                                    transporter.sendMail({
                                        from: EmailAuth.auth.user,
                                        to: newUser.email,
                                        subject: 'My AAP - Account Created',
                                        text: `Your My AAP account as been created by an administrator. Please use your email address and the temporary password to log in. You will be asked to reset reset your password once you log in.\n\nTemporary password: ${tempPassword}`
                                    }, function (error, info) {
                                        if (error) {
                                            console.log(error);
                                            req.flash('error_msg', 'An error occured');
                                            res.redirect('/users/register');
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                            req.flash('success_msg', `The user has been registered. Email has been sent to ${newUser.email}`);
                                            res.redirect('/users/register');
                                        }
                                    });
                                   
                                })
                                .catch(err => console.log(err));
                        })
                    );
                }
            })
        //.catch();
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    //console.log(req.body.password);
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Check if the user must reset their password
router.get('/reset-password', ensureReset, (req, res) => {
    res.render('reset-password', {
        email: req.user.email
    });
});

// Reset the user's password
router.post('/reset-password', ensureReset, (req, res) => {
    const { emailForm, passwordForm, password2Form } = req.body;

    let errors = [];

    // Check required fields
    if (!passwordForm || !password2Form) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (passwordForm != password2Form) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (passwordForm.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters long' });
    }

    if (errors.length > 0) {
        res.render('reset-password', {
            email: req.user.email,
            accountType: req.user.accountType,
            errors,
            passwordForm,
            password2Form
        });
    } else {
        if (req.user.email == emailForm) {
            // Hash Password
            bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(passwordForm, salt, (err, hash) => {
                    if (err) throw err;
                    // Update user
                    User.updateOne({ _id: req.user._id }, {
                        password: hash,
                        passwordReset: false
                    }, function (err, dbres) {
                        // `dbres.modifiedCount` contains the number of docs that MongoDB updated
                        if (err) {
                            console.log(err);
                            req.flash('error_msg', 'An error occured, user may not have been updated');
                            res.redirect('/users/login');
                        } else {
                            req.logout();
                            req.flash('success_msg', 'Password has been successfully updated, you may now login');
                            res.redirect('/users/login');
                        }
                    });

                })
            );

        } else {
            req.flash('error_msg', 'There was an error, contact a System Admin if the issue persists');
            res.redirect('/users/login');
        }
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;