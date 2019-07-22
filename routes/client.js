const express = require('express');
const router = express.Router(); 
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;

// Models
const User = require('../models/User');
// const Client = require('../models/Client');

// Show account info
router.get('/account-info', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        activePage: 'dashboard',
        activeModule: 'account-info',
        name: req.user.name,
        email: req.user.email,
        accountType: req.user.accountType
    })
});

// Show user list
router.get('/valet-summary', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        activePage: 'dashboard',
        activeModule: 'valet-summary',
        name: req.user.name,
        email: req.user.email,
        accountType: req.user.accountType,
        valetSummaryURL: req.user.valetSummaryURL
    })
});

module.exports = router;