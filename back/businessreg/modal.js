const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/, // Basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  businessType: {
    type: String,
    required: false,
    default: null,
  },
  userType: {
    type: String,
    enum: ['businessUser'],
    default: 'businessUser',
  },
  contactNumber: {
    type: String,
    required: false,
    match: /^[0-9]{10,15}$/, // Basic mobile number validation
    default: null,
  },
  locationUrl: {
    type: String,
    required: false,
    match: /^(http|https):\/\/[^ "]+$/, // URL validation
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
}, { timestamps: true });

businessSchema.add({
  previewImage: {
    type: String,
    required: false,
    match: /^(http|https):\/\/[^ "]+$/, // URL validation
    default: null,
  },
});

const business= mongoose.model('Business', businessSchema);
module.exports = business;