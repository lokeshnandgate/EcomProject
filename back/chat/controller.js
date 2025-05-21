const Chat = require('./modal');
const Message = require('../message/modal');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

// Create or access a direct chat
exports.accessChat = async (req, res) => {
  try {
    const { participantId, participantType } = req.body;
    const senderId = req.user.userId;
    const senderType = req.user.userType === 'User' ? 'User' : 'Business';

    if (!participantId || !participantType) {
      return res.status(400).json({ message: 'Participant ID and type are required' });
    }

    // Validate participant existence
    let participant;
    if (participantType === 'User') {
      participant = await User.findById(participantId);
    } else {
      participant = await Business.findById(participantId);
    }

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check for existing 1-on-1 chat with *same two participants and their types*
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { participants: { $all: [senderId, participantId], $size: 2 } },
        { participantModels: { $all: [senderType, participantType], $size: 2 } }
      ]
    })
      .populate({
        path: 'participants',
        strictPopulate: false
      })
      .populate('lastMessage');

    if (chat) {
      return res.status(200).json(chat);
    }

    // Create new 1-on-1 chat
    chat = await Chat.create({
      participants: [senderId, participantId],
      participantModels: [senderType, participantType],
      isGroupChat: false
    });

    const fullChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants',
        strictPopulate: false
      })
      .populate('lastMessage');

    res.status(201).json(fullChat);

  } catch (error) {
    console.error('Access Chat Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create a group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participants, participantTypes } = req.body;
    const adminId = req.user.userId;
    const adminType = req.user.userType === 'User' ? 'User' : 'Business';

    if (!name || !participants || !participantTypes || participants.length !== participantTypes.length) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (participants.length < 2) {
      return res.status(400).json({ message: 'Group must have at least 2 participants' });
    }

    // Check if group with same name already exists for this admin
    const existingGroup = await Chat.findOne({
      isGroupChat: true,
      groupName: name,
      groupAdmin: adminId
    });

    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists under your account' });
    }

    // Check if all participants exist
    for (let i = 0; i < participants.length; i++) {
      const id = participants[i];
      const type = participantTypes[i];

      if (type === 'User') {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ message: `User with ID ${id} not found` });
        }
      } else {
        const business = await Business.findById(id);
        if (!business) {
          return res.status(404).json({ message: `Business with ID ${id} not found` });
        }
      }
    }

    // Create group chat
    const groupChat = await Chat.create({
      groupName: name,
      participants: [...participants, adminId],
      participantModels: [...participantTypes, adminType],
      isGroupChat: true,
      groupAdmin: adminId,
      adminModel: adminType,
      unreadCounts: [...participants, adminId].map((participantId, index) => ({
        participant: participantId,
        participantModel: index < participantTypes.length ? participantTypes[index] : adminType,
        count: 0
      }))
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate({
        path: 'participants',
        strictPopulate: false
      })
      .populate({
        path: 'groupAdmin',
        strictPopulate: false
      })
      .populate('lastMessage');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error('Create Group Chat Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType === 'User' ? 'User' : 'Business';

    const chats = await Chat.find({
      participants: { $in: [userId] },
      participantModel: userType
    })
      .populate('participants')
      .populate('groupAdmin')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single chat
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const userType = req.user.userType === 'User' ? 'User' : 'Business';

    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [userId] },
      participantModel: userType
    })
      .populate('participants')
      .populate('groupAdmin')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to group
exports.addToGroup = async (req, res) => {
  try {
    const { chatId, participantId, participantType } = req.body;
    const adminId = req.user.userId;

    // Check if chat exists and user is admin
    const chat = await Chat.findOne({
      _id: chatId,
      groupAdmin: adminId,
      isGroupChat: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you are not the admin' });
    }

    // Check if participant exists
    let participant;
    if (participantType === 'User') {
      participant = await User.findById(participantId);
    } else {
      participant = await Business.findById(participantId);
    }

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if already in group
    if (chat.participants.includes(participantId)) {
      return res.status(400).json({ message: 'Participant already in group' });
    }

    // Add to group
    chat.participants.push(participantId);
    chat.unreadCounts.push({
      participant: participantId,
      participantModel: participantType,
      count: 0
    });
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants')
      .populate('groupAdmin')
      .populate('lastMessage');

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from group
exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const adminId = req.user.userId;

    // Check if chat exists and user is admin
    const chat = await Chat.findOne({
      _id: chatId,
      groupAdmin: adminId,
      isGroupChat: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you are not the admin' });
    }

    // Remove from group
    chat.participants = chat.participants.filter(
      participant => participant.toString() !== participantId
    );
    chat.unreadCounts = chat.unreadCounts.filter(
      uc => uc.participant.toString() !== participantId
    );
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants')
      .populate('groupAdmin')
      .populate('lastMessage');

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};