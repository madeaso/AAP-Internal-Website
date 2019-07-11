const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;

// Models
const User = require('../models/User');
const Client = require('../models/Client');

// Show user list
router.get('/valet-summary', ensureAuthenticated, (req, res) => {
    
    });

module.exports = router;