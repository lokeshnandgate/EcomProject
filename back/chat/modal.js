const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participantModel'
  }],
  participantModel: {
    type: String,
    enum: ['User', 'Business'],
    required: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    required: function() { return this.isGroupChat; }
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'adminModel',
    required: function() { return this.isGroupChat; }
  },
  adminModel: {
    type: String,
    enum: ['User', 'Business']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCounts: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'unreadCounts.participantModel'
    },
    participantModel: {
      type: String,
      enum: ['User', 'Business']
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;