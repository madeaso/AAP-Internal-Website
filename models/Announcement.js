const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

module.exports = Announcement;