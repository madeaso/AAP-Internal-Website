const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

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
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        activePage: 'dashboard',
        name: req.user.name,
        email: req.user.email,
        accountType: req.user.accountType
    }));

module.exports = router;