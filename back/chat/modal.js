const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroupChat: {
    type: Boolean,
    default: false,
  },

  // One-to-one and group participants
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participantModels'
    }
  ],

  // Corresponding models for each participant (User or Business)
  participantModels: [
    {
      type: String,
      enum: ['User', 'Business']
    }
  ],

  // Group chat name (required for groups)
  groupName: {
    type: String,
    required: function () {
      return this.isGroupChat;
    }
  },

  // Group admin and their model
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'adminModel',
    required: function () {
      return this.isGroupChat;
    }
  },
  adminModel: {
    type: String,
    enum: ['User', 'Business']
  },

  // Last message reference
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Unread message counts per user/business
  unreadCounts: [
    {
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
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
