const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;

// Announcement model
const Announcement = require('../models/Announcement');

// Welcome Page
router.get('/', (req, res) => {
    if (req.user) {
        res.render('welcome', {
            activePage: 'home',
            email: req.user.email,
            accountType: req.user.accountType
        });
    } else {
        res.render('welcome', {
            activePage: 'home'
        });
    }
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => Announcement.find({})
    .then(announcements => {
        res.render('dashboard', {
            activePage: 'dashboard',
            activeModule: 'announcements',
            name: req.user.name,
            email: req.user.email,
            accountType: req.user.accountType,
            announcements
        });
    })
);

module.exports = router;