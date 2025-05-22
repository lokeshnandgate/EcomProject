const mongoose = require('mongoose');

const unreadCountSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
}, { _id: false });

const participantSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'participants.participantModel'
  },
  participantModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  participants: [participantSchema],
  unreadCounts: [unreadCountSchema],
  lastMessage: {
    type: mongoose.Schema.Types.Mixed // or use a short summary like content & timestamp
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupDescription: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'groupAdminModel'
  },
  groupAdminModel: {
    type: String,
    enum: ['User', 'Business']
  },
  groupImage: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v.startsWith('data:image/') || v.startsWith('http');
      },
      message: props => `${props.value} is not a valid image URL or base64 string`
    }
  },
  deletedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'deletedFor.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Business']
    }
  }]
}, { timestamps: true });

// Indexes
chatSchema.index({ 'participants.participant': 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;