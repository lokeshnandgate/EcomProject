const { Message, ChatRoom } = require('./modal');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

// Create or get existing chat room
exports.createOrGetChatRoom = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUser = req.user;

    // Check if participant exists
    let participant = await User.findById(participantId);
    let participantModel = 'User';
    
    if (!participant) {
      participant = await Business.findById(participantId);
      participantModel = 'Business';
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
    }

    // Check if chat room already exists
    const existingRoom = await ChatRoom.findOne({
      participants: {
        $all: [
          { $elemMatch: { participantId: currentUser._id, participantModel: currentUser.userType === 'User' ? 'User' : 'Business' } },
          { $elemMatch: { participantId: participant._id, participantModel: participantModel } }
        ]
      }
    });

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }

    // Create new chat room
    const newRoom = new ChatRoom({
      participants: [
        {
          participantId: currentUser._id,
          participantModel: currentUser.userType === 'User' ? 'User' : 'Business'
        },
        {
          participantId: participant._id,
          participantModel: participantModel
        }
      ]
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId, content } = req.body;
    const currentUser = req.user;

    // Check if chat room exists
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Create new message
    const newMessage = new Message({
      chatRoomId,
      sender: currentUser._id,
      senderModel: currentUser.userType === 'User' ? 'User' : 'Business',
      content
    });

    await newMessage.save();

    // Update chat room's last message
    chatRoom.lastMessage = newMessage._id;
    await chatRoom.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a chat room
exports.getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const currentUser = req.user;

    // Check if chat room exists and user is a participant
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(
      p => p.participantId.equals(currentUser._id) && 
           p.participantModel === (currentUser.userType === 'User' ? 'User' : 'Business')
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ chatRoomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profilePic');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update message status (read/delivered)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = req.user;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is a participant in the chat room
    const chatRoom = await ChatRoom.findById(message.chatRoomId);
    const isParticipant = chatRoom.participants.some(
      p => p.participantId.equals(currentUser._id) && 
           p.participantModel === (currentUser.userType === 'User' ? 'User' : 'Business')
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to update this message' });
    }

    // Check if message is already read by this user
    const alreadyRead = message.readBy.some(
      r => r.readerId.equals(currentUser._id) && 
           r.readerModel === (currentUser.userType === 'User' ? 'User' : 'Business')
    );

    if (!alreadyRead) {
      message.readBy.push({
        readerId: currentUser._id,
        readerModel: currentUser.userType === 'User' ? 'User' : 'Business'
      });
      
      if (message.readBy.length === chatRoom.participants.length - 1) {
        message.status = 'read';
      } else {
        message.status = 'delivered';
      }
      
      await message.save();
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update typing status
exports.updateTypingStatus = async (req, res) => {
  try {
    const { chatRoomId, isTyping } = req.body;
    const currentUser = req.user;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Find the participant and update typing status
    const participantIndex = chatRoom.participants.findIndex(
      p => p.participantId.equals(currentUser._id) && 
           p.participantModel === (currentUser.userType === 'User' ? 'User' : 'Business')
    );

    if (participantIndex === -1) {
      return res.status(403).json({ message: 'Not a participant in this chat room' });
    }

    chatRoom.participants[participantIndex].typing = isTyping;
    await chatRoom.save();

    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update last seen
exports.updateLastSeen = async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    const currentUser = req.user;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Find the participant and update last seen
    const participantIndex = chatRoom.participants.findIndex(
      p => p.participantId.equals(currentUser._id) && 
           p.participantModel === (currentUser.userType === 'User' ? 'User' : 'Business')
    );

    if (participantIndex === -1) {
      return res.status(403).json({ message: 'Not a participant in this chat room' });
    }

    chatRoom.participants[participantIndex].lastSeen = new Date();
    await chatRoom.save();

    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's chat rooms
exports.getUserChatRooms = async (req, res) => {
  try {
    const currentUser = req.user;

    const chatRooms = await ChatRoom.find({
      'participants.participantId': currentUser._id,
      'participants.participantModel': currentUser.userType === 'User' ? 'User' : 'Business'
    })
      .populate('participants.participantId', 'username profilePic')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};