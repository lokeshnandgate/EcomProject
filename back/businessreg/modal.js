const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessType: { type: String, required: true },
    userType: {
        type: String,
        enum: ['businessUser'],
        default: 'businessUser',
      },
}, { timestamps: true });

const business= mongoose.model('Business', businessSchema);
module.exports = business;