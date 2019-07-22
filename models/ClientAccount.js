const mongoose = require('mongoose');

const User = require('./User');

const ClientAccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    valetSummaryURL: {
        type: String,
        default: ''
    },
    operationalContact: {
        name: String,
        phone: String,
        email: String
    },
    salesContact: {
        name: String,
        phone: String,
        email: String
    },
    billingContact: {
        name: String,
        phone: String,
        email: String
    },
    relatedUsers: []
})

const ClientAccount = mongoose.model('Client', ClientAccountSchema);

module.exports = ClientAccount;