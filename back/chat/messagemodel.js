const mongoose = require('mongoose');

// Schema for read receipts
const readByRecipientSchema = new mongoose.Schema({
  reader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Corrected refPath: it should refer to the 'readerModel' field directly within this subdocument
    refPath: 'readerModel'
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
  // _id is true by default for subdocuments, but explicitly setting it for clarity
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId() // Generate _id for subdocument
  },
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
      // If userModel is a direct field of the deletedFor subdocument, use 'userModel'
      // If it's a field of the main messageSubSchema, then this would be more complex.
      // Assuming 'userModel' is direct field of the deletedFor subdocument
      refPath: 'deletedFor.userModel' // This might need adjustment based on how you populate deletedFor
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      // Assuming 'userModel' is direct field of the reactions subdocument
      refPath: 'reactions.userModel' // This might need adjustment
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    },
    emoji: String
  }],
  replyTo: {
    // This now references the _id of another message subdocument within the *same* parent Message document.
    // Direct Mongoose populate for subdocument _id is not supported.
    // We will handle this manually in the sendMessage function.
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // _id: true ensures subdocuments get an _id

// Main message thread schema
const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    unique: true // Ensures only one Message document per Chat
  },
  messages: [messageSubSchema] // Array of actual messages
}, { timestamps: true }); // Adds createdAt and updatedAt to the parent document

// Indexes
messageSchema.index({ chat: 1 });
messageSchema.index({ 'messages.sender': 1 }); // Index for sender in subdocuments
messageSchema.index({ 'messages.createdAt': -1 }); // Index for sorting messages

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
