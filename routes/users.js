const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAdmin = require('../config/auth').ensureAdmin;

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
    const { nameForm, emailForm, accountTypeForm, positionForm, passwordForm, password2Form } = req.body;
    let errors = [];

    // Check required fields
    if (!nameForm || !emailForm || !accountTypeForm || !passwordForm || !password2Form || (accountTypeForm == 'Employee' && !positionForm)) {
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
        res.render('register', {
            activePage: 'register',
            errors,
            nameForm,
            emailForm,
            accountTypeForm,
            positionForm,
            passwordForm,
            password2Form
        });
    } else {
        // Validation passed
        User.findOne({ email: emailForm })
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'This email is already registered' });
                    res.render('register', {
                        activePage: 'register',
                        errors,
                        nameForm,
                        emailForm,
                        accountTypeForm,
                        positionForm,
                        passwordForm,
                        password2Form
                    });
                } else {
                    const newUser = new User({
                        name: nameForm,
                        email: emailForm,
                        accountType: accountTypeForm,
                        position: positionForm,
                        password: passwordForm
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
                                    req.flash('success_msg', 'The user has been registered');
                                    res.redirect('/users/register');
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

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;