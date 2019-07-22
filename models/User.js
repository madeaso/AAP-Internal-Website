const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true
    },
    clientAccountIDRef: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    passwordReset: {
        type: Boolean,
        required: true,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;