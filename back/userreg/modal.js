const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userType: {
    type: String,
    enum: ['User'],
    default: 'User',
  },
  contactNumber: {
    type: String,
    required: false, // Make it true if you want mandatory
    match: /^[0-9]{10,15}$/, // Basic mobile number validation
    default: null,
  },
  locationUrl: {
    type: String,
    required: false,
    match: /^(http|https):\/\/[^ "]+$/, // Must be a URL
    default: null,
  },
  address: {
    type: String,
    required: false,
    minlength: 10,
    default: null,
  },
  about: {
    type: String,
    required: false,
    maxlength: 500,
    default: null,
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now,
  },
  loginHistory: [{
    type: Date,
    default: Date.now,
  }],
  logoutHistory: [{
    type: Date,
    default: Date.now,
  }],
  loginCount: {
    type: Number,
    default: 0,
  },
  logoutCount: {
    type: Number,
    default: 0,
  },
  previewImage: {
    type: String,
    required: false,
    match: /^(http|https):\/\/[^ "]+$/, // Must be a URL
    default: null,
  },
});


// Check if the model is already compiled, and if not, create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
