const mongoose = require('mongoose');

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
    relatedUsers: [String],
    date: {
        type: Date,
        default: Date.now
    }
})

const ClientAccount = mongoose.model('Client Account', ClientAccountSchema);

module.exports = ClientAccount;