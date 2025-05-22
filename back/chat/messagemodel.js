const mongoose = require('mongoose');

const readByRecipientSchema = new mongoose.Schema({
  reader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'readBy.readerModel'
  },
  readerModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  url: String,
  fileType: String,
  fileName: String,
  size: Number
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  content: {
    type: String,
    trim: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  readBy: [readByRecipientSchema],
  attachments: [attachmentSchema],
  deletedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'deletedFor.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reactions.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    },
    emoji: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ 'readBy.reader': 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;