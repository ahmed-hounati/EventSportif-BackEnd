const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    image: { type: String },
    status: { type: String }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
