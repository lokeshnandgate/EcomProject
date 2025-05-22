const mongoose = require('mongoose');

// Schema for read receipts
const readByRecipientSchema = new mongoose.Schema({
  reader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'messages.readBy.readerModel'
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

// Schema for attachments
const attachmentSchema = new mongoose.Schema({
  url: String,
  fileType: String,
  fileName: String,
  size: Number
}, { _id: false });

// Single message subdocument schema
const messageSubSchema = new mongoose.Schema({
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
  readBy: [readByRecipientSchema],
  attachments: [attachmentSchema],
  deletedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel'
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main message thread schema
const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    unique: true
  },
  messages: [messageSubSchema]
}, { timestamps: true });

// Indexes
messageSchema.index({ chat: 1 });
messageSchema.index({ 'messages.readBy.reader': 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
