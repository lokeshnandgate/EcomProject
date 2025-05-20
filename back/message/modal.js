const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Business'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    reader: {
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
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'deletedFor.deletedForModel'
  }],
  deletedForModel: {
    type: String,
    enum: ['User', 'Business']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;