const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  content: {
    type: String,
    required: true
  },
  readBy: [{
    readerId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'readBy.readerModel'
    },
    readerModel: {
      type: String,
      enum: ['User', 'Business']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, { timestamps: true });

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.participantModel',
      required: true
    },
    participantModel: {
      type: String,
      required: true,
      enum: ['User', 'Business']
    },
    lastSeen: {
      type: Date,
      default: null
    },
    typing: {
      type: Boolean,
      default: false
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
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

const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = { Message, ChatRoom };