const Message = require('./messagemodel');
const Chat = require('./chatmodel');
const { getIO } = require('../sockets/chatSocket');
const mongoose = require('mongoose');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, attachments = [], replyTo } = req.body;
    const senderId = req.user.userId;
    const senderModel = req.user.userType === 'User' ? 'User' : 'Business';

    if (!chatId || (!content && attachments.length === 0)) {
      return res.status(400).json({ error: 'Chat ID and content or attachments are required' });
    }

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': senderId
    });

    if (!chat) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      senderModel,
      content,
      chat: chatId,
      attachments,
      replyTo
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    
    // Increment unread counts for other participants
    chat.unreadCounts.forEach(uc => {
      if (uc.participant.toString() !== senderId.toString()) {
        uc.count += 1;
      }
    });

    await chat.save();

    // Populate message with sender info
    const fullMessage = await Message.findById(message._id)
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username profilePic'
        }
      });

    // Emit to all participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('messageReceived', fullMessage);
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': userId
    });

    if (!chat) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }

    // Get messages, excluding those deleted for this user
    const messages = await Message.find({
      chat: chatId,
      'deletedFor.user': { $ne: userId }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username profilePic'
        }
      });

    // Reverse to show oldest first on client
    const reversedMessages = messages.reverse();

    res.json(reversedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    // Mark messages as read in DB
    await Message.updateMany(
      {
        chat: chatId,
        'readBy.reader': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            reader: userId,
            readerModel: userModel
          }
        }
      }
    );

    // Reset unread count in chat
    const chat = await Chat.findById(chatId);
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === userId.toString()
    );
    
    if (unreadIndex !== -1) {
      chat.unreadCounts[unreadIndex].count = 0;
      await chat.save();
    }

    // Notify other participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      if (participant.participant.toString() !== userId.toString()) {
        io.to(participant.participant.toString()).emit('messagesRead', { chatId, userId });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender or a participant in the chat
    const chat = await Chat.findOne({
      _id: message.chat,
      'participants.participant': userId
    });

    if (!chat) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }

    // Add user to deletedFor array
    if (!message.deletedFor.some(df => df.user.toString() === userId.toString())) {
      message.deletedFor.push({ user: userId, userModel });
      await message.save();
    }

    // If all participants have deleted the message, hard delete it
    const allParticipantsDeleted = chat.participants.every(participant => 
      message.deletedFor.some(df => df.user.toString() === participant.participant.toString())
    );

    if (allParticipantsDeleted) {
      await Message.findByIdAndDelete(messageId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Find and update the message
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: userId,
        'deletedFor.user': { $ne: userId }
      },
      {
        content,
        isEdited: true
      },
      { new: true }
    ).populate('sender');

    if (!message) {
      return res.status(404).json({ error: 'Message not found or you are not the sender' });
    }

    // Notify participants via socket.io
    const chat = await Chat.findById(message.chat);
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('messageEdited', message);
    });

    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

// React to a message
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: message.chat,
      'participants.participant': userId
    });

    if (!chat) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      r => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      // Remove the reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, userModel, emoji });
    }

    await message.save();

    // Notify participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('messageReaction', {
        messageId,
        reactions: message.reactions
      });
    });

    res.json(message.reactions);
  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ error: 'Failed to react to message' });
  }
};