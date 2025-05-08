const Chat = require('./modal');
const User = require('../userreg/modal');
const businessUser = require('../businessreg/modal');

// Send a message
const sendMessage = async (req, res) => {
  const { receiverId, receiverType, message, groupId } = req.body;
  const { id: senderId, userType: senderType } = req.user; // Extracted from token

  try {
    const senderModel = senderType === 'User' ? User : businessUser;
    const receiverModel = receiverType === 'User' ? User : businessUser;

    const senderExists = await senderModel.findById(senderId);
    const receiverExists = await receiverModel.findById(receiverId);

    if (!senderExists || !receiverExists) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    const chatMessage = new Chat({
      senderId,
      senderType,
      receiverId,
      receiverType,
      message,
      groupId,
    });

    await chatMessage.save();

    res.status(201).json({ message: 'Message sent', chatMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Fetch chat history
const getChatHistory = async (req, res) => {
  const { userId } = req.body;

  try {
    const chats = await Chat.find({
      receiverId: userId,
    }).sort({ timestamp: 1 });

    res.status(200).json({ messages: chats });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

// Fetch user list
const getUserList = async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, _id: 0 });
    const businessUsers = await businessUser.find({}, { username: 1, _id: 0 });

    res.status(200).json({ users, businessUsers });
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).json({ message: 'Failed to get user list' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getUserList,
};

