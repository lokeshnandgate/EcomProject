const Chat = require('./modal');
const User = require('../userreg/modal');
const businessUser = require('../businessreg/modal');

const create = async (req, res) => {
  const { participant2Id, participant2Type } = req.body;

  const participant1Id = req.user.id;
  const participant1Type = req.user.userType;
  console.log('Participant 1:', participant1Id, participant1Type);
  console.log('Participant 2:', participant2Id, participant2Type);
  

  try {
    const participant1Model = participant1Type === 'User' ? User : businessUser;
    const participant2Model = participant2Type === 'User' ? User : businessUser;

    const [participant1, participant2] = await Promise.all([
      participant1Model.findById(participant1Id),
      participant2Model.findById(participant2Id)
    ]);

    if (!participant1 || !participant2) {
      return res.status(404).json({ message: 'One or both participants not found' });
    }

    const existingRoom = await Chat.findOne({
      $or: [
        { 
          participant1Id,
          participant1Type,
          participant2Id,
          participant2Type
        },
        { 
          participant1Id: participant2Id,
          participant1Type: participant2Type,
          participant2Id: participant1Id,
          participant2Type: participant1Type
        }
      ]
    });

    if (existingRoom) {
      return res.status(200).json({ 
        message: 'Chat room already exists', 
        room: existingRoom 
      });
    }

    const newRoom = new Chat({
      participant1Id,
      participant1Type,
      participant2Id,
      participant2Type,
      messages: []
    });

    await newRoom.save();
    res.status(201).json({ message: 'Chat room created', room: newRoom });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Failed to create chat room' });
  }
};

const addNewMessage = async (req, res) => {
  const { roomId, message } = req.body;
  const senderId = req.user.id;
  const senderType = req.user.userType;

  try {
    const room = await Chat.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const newMessage = {
      senderId,
      senderType,
      message,
      timestamp: new Date(),
      read: false
    };

    room.messages.push(newMessage);
    await room.save();
    res.status(201).json({ message: 'Message added', room });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
};

const getRooms = async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;

  try {
    const rooms = await Chat.find({
      $or: [
        { participant1Id: userId, participant1Type: userType },
        { participant2Id: userId, participant2Type: userType }
      ]
    }).sort({ updatedAt: -1 });

    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Failed to get rooms' });
  }
};

const findRoomOf2Users = async (req, res) => {
  const { user2Id, user2Type } = req.body;
  const user1Id = req.user.id;
  const user1Type = req.user.userType;

  try {
    const room = await Chat.findOne({
      $or: [
        { 
          participant1Id: user1Id,
          participant1Type: user1Type,
          participant2Id: user2Id,
          participant2Type: user2Type
        },
        { 
          participant1Id: user2Id,
          participant1Type: user2Type,
          participant2Id: user1Id,
          participant2Type: user1Type
        }
      ]
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (error) {
    console.error('Error finding room:', error);
    res.status(500).json({ message: 'Failed to find room' });
  }
};

const markMessageAsRead = async (req, res) => {
  const { roomId, messageIds } = req.body;

  try {
    const room = await Chat.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.messages = room.messages.map(msg => {
      if (messageIds.includes(msg._id.toString())) {
        msg.read = true;
      }
      return msg;
    });

    await room.save();
    res.status(200).json({ message: 'Messages marked as read', room });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

const unreadMessagesCount = async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;

  try {
    const rooms = await Chat.find({
      $or: [
        { participant1Id: userId, participant1Type: userType },
        { participant2Id: userId, participant2Type: userType }
      ]
    });

    let totalUnread = 0;
    rooms.forEach(room => {
      const unreadInRoom = room.messages.filter(msg => 
        !msg.read && 
        !(msg.senderId === userId && msg.senderType === userType)
      ).length;
      totalUnread += unreadInRoom;
    });

    res.status(200).json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    res.status(500).json({ message: 'Failed to count unread messages' });
  }
};

module.exports = {
  create,
  addNewMessage,
  getRooms,
  findRoomOf2Users,
  markMessageAsRead,
  unreadMessagesCount
};