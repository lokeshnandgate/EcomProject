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
    minlength: 1,
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
 // In both User and Business schemas, update the profile image field:
profilePic: {
  type: String,
  required: false,
  default: null,
  validate: {
    validator: function(v) {
      if (!v) return true;
      return v.startsWith('data:image/') || v.startsWith('http');
    },
    message: props => `${props.value} is not a valid image URL or base64 string`
  }
}
});


// Check if the model is already compiled, and if not, create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
