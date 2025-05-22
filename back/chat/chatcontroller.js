const Chat = require('./chatmodel');
const Message = require('./messagemodel');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');
const { getIO } = require('../sockets/chatSocket');
const mongoose = require('mongoose');

// Create a new chat (individual or group)
exports.createChat = async (req, res) => {
  try {
    const { participants, isGroup = false, groupName, groupDescription } = req.body;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: 'Participants are required' });
    }

    // For individual chat, check if chat already exists
    if (!isGroup && participants.length === 1) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: {
          $all: [
            { participant: userId, participantModel: userModel },
            { participant: participants[0].participantId, participantModel: participants[0].participantType }
          ],
          $size: 2
        }
      });

      if (existingChat) {
        return res.status(200).json(existingChat);
      }
    }

    // Prepare participants array
    const participantsArray = [
      { participant: userId, participantModel: userModel }
    ];

    // Validate and add other participants
    for (const p of participants) {
      console.log('Checking participant:', p);
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
        participantModel: p.participantType
      });
    }
    

    // Create chat
    const chat = new Chat({
      participants: participantsArray,
      isGroup,
      unreadCounts: participantsArray.map(p => ({
        participant: p.participant,
        count: 0
      }))
    });

    if (isGroup) {
      chat.groupName = groupName;
      chat.groupDescription = groupDescription;
      chat.groupAdmin = userId;
      chat.groupAdminModel = userModel;
    }

    await chat.save();

    // Populate participants before sending response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.participant',
        select: 'username profilePic userType'
      })
      .populate('lastMessage');

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
      .populate('lastMessage')
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
      'participants.participant': userId
    })
      .populate({
        path: 'participants.participant',
        select: 'username profilePic userType'
      })
      .populate('lastMessage')
      .populate('groupAdmin');

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
      groupAdmin: userId
    });

    if (!chat) {
      return res.status(403).json({ error: 'Only group admin can update group details' });
    }

    if (groupName) chat.groupName = groupName;
    if (groupDescription) chat.groupDescription = groupDescription;
    if (groupImage) chat.groupImage = groupImage;

    await chat.save();

    // Notify participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('groupUpdated', chat);
    });

    res.json(chat);
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
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    // Check if chat exists and is a group
    const chat = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      'participants.participant': userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Group chat not found or access denied' });
    }

    // Check if user is group admin
    if (chat.groupAdmin.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only group admin can add participants' });
    }

    // Validate and add new participants
    for (const p of participants) {
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
        return res.status(404).json({ error: `Participant ${p.participantId} not found` });
      }

      // Add participant
      chat.participants.push({
        participant: p.participantId,
        participantModel: p.participantType
      });

      // Add to unread counts
      chat.unreadCounts.push({
        participant: p.participantId,
        count: 0
      });
    }

    await chat.save();

    // Notify all participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantsAdded', {
        chatId,
        newParticipants: participants
      });
    });

    res.json(chat);
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
      'participants.participant': userId
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
    chat.participants.splice(participantIndex, 1);

    // Remove from unread counts
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === participantId
    );
    if (unreadIndex !== -1) {
      chat.unreadCounts.splice(unreadIndex, 1);
    }

    // If group admin is leaving, assign new admin
    if (chat.groupAdmin.toString() === participantId && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0].participant;
      chat.groupAdminModel = chat.participants[0].participantModel;
    }

    await chat.save();

    // Notify all participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantRemoved', {
        chatId,
        removedParticipantId: participantId
      });
    });

    // Notify removed participant
    io.to(participantId).emit('removedFromGroup', { chatId });

    res.json(chat);
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
      'participants.participant': userId
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

    // If group admin is leaving, assign new admin
    if (chat.groupAdmin.toString() === userId.toString() && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0].participant;
      chat.groupAdminModel = chat.participants[0].participantModel;
    }

    await chat.save();

    // Notify remaining participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('participantLeft', {
        chatId,
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
      chat.deletedFor.push({ user: userId, userModel });
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

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};