const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    valetReportURL: {
        type: String,
        required: false
    }
})

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;