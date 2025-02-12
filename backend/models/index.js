const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// World Context Schema
const worldContextSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    rules: { type: String }
}, { timestamps: true });

// Character Schema
const characterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    traits: [String]
}, { timestamps: true });

// Export models
module.exports = {
    User: mongoose.models.User || mongoose.model('User', userSchema),
    WorldContext: mongoose.models.WorldContext || mongoose.model('WorldContext', worldContextSchema),
    Character: mongoose.models.Character || mongoose.model('Character', characterSchema)
}; 