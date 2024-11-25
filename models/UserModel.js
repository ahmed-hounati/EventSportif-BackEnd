const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Participant' }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
