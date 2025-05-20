const Message = require('../models/Message');
const Chat = require('../chat/modal');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const senderId = req.user.userId;
    const senderType = req.user.userType === 'User' ? 'User' : 'Business';

    if (!content || !chatId) {
      return res.status(400).json({ message: 'Content and chat ID are required' });
    }

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [senderId] }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      senderModel: senderType,
      content,
      chat: chatId
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    await chat.save();

    // Increment unread counts for all participants except sender
    chat.unreadCounts.forEach(uc => {
      if (uc.participant.toString() !== senderId) {
        uc.count += 1;
      }
    });
    await chat.save();

    const fullMessage = await Message.findById(message._id)
      .populate('sender')
      .populate('chat');

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [userId] }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender')
      .populate('chat');

    // Mark messages as read for this user
    await Message.updateMany(
      {
        chat: chatId,
        'readBy.reader': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            reader: userId,
            readerModel: req.user.userType === 'User' ? 'User' : 'Business'
          }
        }
      }
    );

    // Reset unread count for this user in the chat
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === userId
    );
    if (unreadIndex !== -1) {
      chat.unreadCounts[unreadIndex].count = 0;
      await chat.save();
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const userType = req.user.userType === 'User' ? 'User' : 'Business';

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or admin in a group chat
    const chat = await Chat.findById(message.chat);
    const isSender = message.sender.toString() === userId;
    const isAdmin = chat.isGroupChat && chat.groupAdmin.toString() === userId;

    if (!isSender && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // For group chats, mark as deleted for everyone if admin
    if (isAdmin && chat.isGroupChat) {
      message.isDeleted = true;
      await message.save();
    } else {
      // For direct messages or if sender, mark as deleted for this user
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        message.deletedForModel = userType;
        await message.save();
      }
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};