const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const pwGenerate = require('generate-password');
const nodemailer = require('nodemailer');

const ensureAdmin = require('../config/auth').ensureAdmin;
const EmailAuth = require('../config/keys').EmailAuth;

// Models
const User = require('../models/User');
const ClientAccount = require('../models/ClientAccount');
const Announcement = require('../models/Announcement');

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

// Show client list
router.get('/client-list', ensureAdmin, (req, res) => ClientAccount.find({})
    .then(clientAccounts => {
        res.render('dashboard', {
            activePage: 'dashboard',
            activeModule: 'client-list',
            name: req.user.name,
            email: req.user.email,
            accountType: req.user.accountType,
            list: clientAccounts
        });
    }));

// New client account form
router.get('/register-client', ensureAdmin, (req, res) => {
    res.render('register-client', {
        activePage: 'register-client',
        name: req.user.name,
        email: req.user.email,
        accountType: req.user.accountType
    });
});

// Create new client account
router.post('/register-client', ensureAdmin, (req, res) => {
    const { nameForm, addressForm, valetSummaryURLForm,
        operationalContactName, operationalContactEmail, operationalContactPhone,
        salesContactName, salesContactEmail, salesContactPhone,
        billingContactName, billingContactEmail, billingContactPhone,
        relatedUsersForm } = req.body;

        let errors = [];
    // Check required fields
    if (!nameForm || !addressForm) {
        errors.push({ msg: 'Account name and address are both required' });
        res.render('register-client', {
            activePage: 'register-client',
            name: req.user.name,
            email: req.user.email,
            accountType: req.user.accountType,
            nameForm, addressForm, valetSummaryURLForm,
            operationalContactName, operationalContactEmail, operationalContactPhone,
            salesContactName, salesContactEmail, salesContactPhone,
            billingContactName, billingContactEmail, billingContactPhone,
            relatedUsersForm,
            errors
        });
    } else {
        // Validation passed

        ClientAccount.findOne({ name: nameForm })
            .then(clientAccount => {
                if (clientAccount) {
                    // Account exists
                    errors.push({ msg: 'A client account with that name already exists' });
                    res.render('register-client', {
                        activePage: 'register-client',
                        name: req.user.name,
                        email: req.user.email,
                        accountType: req.user.accountType,
                        nameForm, addressForm, valetSummaryURLForm,
                        operationalContactName, operationalContactEmail, operationalContactPhone,
                        salesContactName, salesContactEmail, salesContactPhone,
                        billingContactName, billingContactEmail, billingContactPhone,
                        relatedUsersForm,
                        errors
                    });
                } else {
                    const newClientAccount = new ClientAccount({
                        name: nameForm,
                        address: addressForm,
                        valetSummaryURL: valetSummaryURLForm,
                        operationalContact: {
                            name: operationalContactName,
                            email: operationalContactEmail,
                            phone: operationalContactPhone
                        },
                        salesContact: {
                            name: salesContactName,
                            email: salesContactEmail,
                            phone: salesContactPhone
                        },
                        billingContact: {
                            name: billingContactName,
                            email: billingContactEmail,
                            phone: billingContactPhone
                        },
                        relatedUsers: relatedUsersForm
                    });
                    newClientAccount.save()
                        .then(clientAccount => {
                            req.flash('success_msg', `The account ${newClientAccount.name} has been created`);
                            res.redirect('/admin/register-client');
                        })
                        .catch(err => {
                            console.log(err);
                            req.flash('error_msg', 'An error occured');
                            res.redirect('/admin/register-client');
                        });
                }
            })
    }
});

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

// New announcement
router.post('/new-announcement', ensureAdmin, (req, res) => {
    const { titleForm, messageForm } = req.body;
    // Validate announcement
    if (!titleForm || !messageForm) {
        req.flash('error_msg', 'Announcement title and message are both required');
        res.redirect('/dashboard');
    } else {
        // Save announcement
        const newAnnouncement = new Announcement({
            author: req.user.name,
            title: titleForm,
            message: messageForm
        });
        newAnnouncement.save()
            .then(announcement => {
                req.flash('success_msg', 'Announcement has been added');
                res.redirect('/dashboard');
            });
    }
});

module.exports = router;