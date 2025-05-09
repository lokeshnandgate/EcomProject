const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    required: true,
    enum: ['User', 'businessUser']
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatRoomSchema = new mongoose.Schema({
  participant1Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  participant1Type: {
    type: String,
    required: true,
    enum: ['User', 'businessUser']
  },
  participant2Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  participant2Type: {
    type: String,
    required: true,
    enum: ['User', 'businessUser']
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatRoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

chatRoomSchema.index({
  participant1Id: 1,
  participant1Type: 1,
  participant2Id: 1,
  participant2Type: 1
}, { unique: true });

const Chat = mongoose.model('Chat', chatRoomSchema);

module.exports = Chat;