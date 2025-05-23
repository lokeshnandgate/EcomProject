const Chat = require('./chatmodel');
const Message = require('./messagemodel');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');
const { getIO } = require('../sockets/chatSocket');
const mongoose = require('mongoose');

// Create a new chat (individual or group)
exports.createChat = async (req, res) => {
  try {
    const { participants, isGroup = false, groupName, groupDescription, groupImage } = req.body;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: 'Participants are required' });
    }

    // Construct full participant list including the current user
    const participantsArray = [
      { 
        participant: userId, 
        participantModel: userModel,
        joinedAt: new Date()
      }
    ];

    // Validate and add other participants
    for (const p of participants) {
      if (!p || !p.participantId || !p.participantType) {
        return res.status(400).json({ error: 'Each participant must have participantId and participantType' });
      }

      if (p.participantId.toString() === userId.toString()) continue;

      let userExists;
      if (p.participantType === 'User') {
        userExists = await User.findById(p.participantId);
      } else {
        userExists = await Business.findById(p.participantId);
      }

      if (!userExists) {
        return res.status(404).json({ error: `Participant ${p.participantId} not found` });
      }

      participantsArray.push({
        participant: p.participantId,
        participantModel: p.participantType,
        joinedAt: new Date()
      });
    }

    // Sort participants for consistent comparison
    const sortedParticipantKeys = participantsArray
      .map(p => `${p.participant.toString()}-${p.participantModel}`)
      .sort();

    // Find existing chat with exact same participants and type
    const existingChats = await Chat.find({ 
      isGroup,
      'deletedFor.user': { $ne: userId }
    }).populate('participants.participant');

    for (const chat of existingChats) {
      const chatParticipantKeys = chat.participants
        .map(p => `${p.participant._id.toString()}-${p.participantModel}`)
        .sort();

      if (
        sortedParticipantKeys.length === chatParticipantKeys.length &&
        sortedParticipantKeys.every((val, index) => val === chatParticipantKeys[index])
      ) {
        return res.status(200).json(chat);
      }
    }

    // Create new chat
    const chat = new Chat({
      participants: participantsArray,
      isGroup,
      unreadCounts: participantsArray.map(p => ({
        participant: p.participant,
        count: 0
      })),
      ...(isGroup && {
        groupName,
        groupDescription,
        groupImage,
        groupAdmin: userId,
        groupAdminModel: userModel
      })
    });

    await chat.save();

    // Populate the chat before returning
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic userType'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username profilePic'
        }
      })
      .populate({
        path: 'groupAdmin',
        select: 'username profilePic'
      });

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    const chats = await Chat.find({
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    })
      .populate({
        path: 'participants.participant',
        select: 'username profilePic userType'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username profilePic'
        }
      })
      .populate({
        path: 'groupAdmin',
        select: 'username profilePic'
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Get chat details
exports.getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    })
      .populate({
        path: 'participants.participant',
        select: 'username profilePic userType'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender replyTo',
          select: 'username profilePic content'
        }
      })
      .populate({
        path: 'groupAdmin',
        select: 'username profilePic'
      });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat details:', error);
    res.status(500).json({ error: 'Failed to fetch chat details' });
  }
};

// Update group chat details
exports.updateGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { groupName, groupDescription, groupImage } = req.body;
    const userId = req.user.userId;

    // Check if user is group admin
    const chat = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      groupAdmin: userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      return res.status(403).json({ error: 'Only group admin can update group details' });
    }

    if (groupName !== undefined) chat.groupName = groupName;
    if (groupDescription !== undefined) chat.groupDescription = groupDescription;
    if (groupImage !== undefined) chat.groupImage = groupImage;

    await chat.save();

    // Populate before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic'
      })
      .populate('lastMessage')
      .populate('groupAdmin');

    // Notify participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('groupUpdated', populatedChat);
    });

    res.json(populatedChat);
  } catch (error) {
    console.error('Error updating group chat:', error);
    res.status(500).json({ error: 'Failed to update group chat' });
  }
};

// Add participants to group chat
exports.addParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participants } = req.body;
    const userId = req.user.userId;

    // Check if chat exists and is a group
    const chat = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found or access denied' });
    }

    // Check if user is group admin
    if (chat.groupAdmin.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only group admin can add participants' });
    }

    const newParticipants = [];
    
    // Validate and add new participants
    for (const p of participants) {
      if (!p || !p.participantId || !p.participantType) {
        continue;
      }

      // Check if participant already exists
      const exists = chat.participants.some(
        participant => participant.participant.toString() === p.participantId.toString()
      );

      if (exists) continue;

      // Check if participant exists in database
      let userExists;
      if (p.participantType === 'User') {
        userExists = await User.findById(p.participantId);
      } else {
        userExists = await Business.findById(p.participantId);
      }

      if (!userExists) {
        continue;
      }

      // Add participant
      chat.participants.push({
        participant: p.participantId,
        participantModel: p.participantType,
        joinedAt: new Date()
      });

      // Add to unread counts
      chat.unreadCounts.push({
        participant: p.participantId,
        count: 0
      });

      newParticipants.push({
        participant: p.participantId,
        participantModel: p.participantType
      });
    }

    if (newParticipants.length === 0) {
      return res.status(400).json({ error: 'No valid new participants to add' });
    }

    await chat.save();

    // Populate before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic'
      })
      .populate('lastMessage')
      .populate('groupAdmin');

    // Notify all participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantsAdded', {
        chatId,
        chat: populatedChat,
        newParticipants
      });
    });

    res.json(populatedChat);
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ error: 'Failed to add participants' });
  }
};

// Remove participant from group chat
exports.removeParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.params;
    const userId = req.user.userId;

    // Check if chat exists and is a group
    const chat = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found or access denied' });
    }

    // Check if user is group admin or is removing themselves
    if (chat.groupAdmin.toString() !== userId.toString() && participantId !== userId.toString()) {
      return res.status(403).json({ error: 'Only group admin can remove participants' });
    }

    // Check if participant exists
    const participantIndex = chat.participants.findIndex(
      p => p.participant.toString() === participantId
    );

    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Participant not found in this group' });
    }

    // Remove participant
    const removedParticipant = chat.participants[participantIndex];
    chat.participants.splice(participantIndex, 1);

    // Remove from unread counts
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === participantId
    );
    if (unreadIndex !== -1) {
      chat.unreadCounts.splice(unreadIndex, 1);
    }

    // If group admin is leaving or being removed, assign new admin if possible
    if (chat.groupAdmin.toString() === participantId && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0].participant;
      chat.groupAdminModel = chat.participants[0].participantModel;
    }

    await chat.save();

    // Populate before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic'
      })
      .populate('lastMessage')
      .populate('groupAdmin');

    // Notify all participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantRemoved', {
        chatId,
        chat: populatedChat,
        removedParticipantId: participantId
      });
    });

    // Notify removed participant
    io.to(participantId).emit('removedFromGroup', { 
      chatId,
      removedBy: userId 
    });

    res.json(populatedChat);
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
};

// Leave group chat
exports.leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if chat exists and is a group
    const chat = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found or access denied' });
    }

    // Find participant index
    const participantIndex = chat.participants.findIndex(
      p => p.participant.toString() === userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(404).json({ error: 'You are not a participant in this group' });
    }

    // Remove participant
    chat.participants.splice(participantIndex, 1);

    // Remove from unread counts
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === userId.toString()
    );
    if (unreadIndex !== -1) {
      chat.unreadCounts.splice(unreadIndex, 1);
    }

    // If group admin is leaving, assign new admin if possible
    if (chat.groupAdmin.toString() === userId.toString() && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0].participant;
      chat.groupAdminModel = chat.participants[0].participantModel;
    }

    await chat.save();

    // Populate before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic'
      })
      .populate('lastMessage')
      .populate('groupAdmin');

    // Notify remaining participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantLeft', {
        chatId,
        chat: populatedChat,
        leftParticipantId: userId
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

// Delete chat (soft delete)
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    // Find the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Add user to deletedFor array
    if (!chat.deletedFor.some(df => df.user.toString() === userId.toString())) {
      chat.deletedFor.push({ 
        user: userId, 
        userModel,
        deletedAt: new Date()
      });
      await chat.save();
    }

    // If all participants have deleted the chat, hard delete it and its messages
    const allParticipantsDeleted = chat.participants.every(participant => 
      chat.deletedFor.some(df => df.user.toString() === participant.participant.toString())
    );

    if (allParticipantsDeleted) {
      await Message.deleteMany({ chat: chatId });
      await Chat.findByIdAndDelete(chatId);
    }

    // Notify other participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      if (participant.participant.toString() !== userId.toString()) {
        io.to(participant.participant.toString()).emit('chatDeleted', { 
          chatId,
          deletedBy: userId
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

//search for users and business
exports.searchUsersAndBusiness = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    // Validate query
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Search for users
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: userId }
    }).select('username profilePic userType');

    // Search for businesses
    const businesses = await Business.find({
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: userId }
    }).select('businessName profilePic businessType');

    res.json({ users, businesses });
  } catch (error) {
    console.error('Error searching users and businesses:', error);
    res.status(500).json({ error: 'Failed to search users and businesses' });
  }
};