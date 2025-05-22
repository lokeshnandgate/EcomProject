const socketio = require('socket.io');
const Chat = require('../chat/chatmodel');
const Message = require('../chat/messagemodel');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

let io;

// Initialize socket.io
exports.init = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  // Set up socket connection handlers
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join user's room
    socket.on('join', async (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle new message
    socket.on('newMessage', async (messageData) => {
      try {
        const { chatId, content, senderId, senderType, attachments = [] } = messageData;

        // Create message in DB
        const message = await Message.create({
          sender: senderId,
          senderModel: senderType,
          content,
          chat: chatId,
          attachments
        });

        // Update chat's last message
        const chat = await Chat.findByIdAndUpdate(
          chatId,
          { lastMessage: message._id },
          { new: true }
        ).populate('participants.participant');

        // Increment unread counts for all participants except sender
        chat.unreadCounts.forEach(uc => {
          if (uc.participant.toString() !== senderId) {
            uc.count += 1;
          }
        });
        await chat.save();

        // Populate message before sending
        const fullMessage = await Message.findById(message._id)
          .populate('sender')
          .populate('chat')
          .populate({
            path: 'replyTo',
            populate: {
              path: 'sender',
              select: 'username profilePic'
            }
          });

        // Emit to all participants
        chat.participants.forEach(participant => {
          io.to(participant.participant._id.toString()).emit('messageReceived', fullMessage);
        });
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });

    // Handle message read
    socket.on('markAsRead', async ({ chatId, userId, userType }) => {
      try {
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
                readerModel: userType
              }
            }
          }
        );

        // Reset unread count in chat
        const chat = await Chat.findById(chatId);
        const unreadIndex = chat.unreadCounts.findIndex(
          uc => uc.participant.toString() === userId
        );
        if (unreadIndex !== -1) {
          chat.unreadCounts[unreadIndex].count = 0;
          await chat.save();
        }

        // Notify other participants (optional)
        chat.participants.forEach(participant => {
          if (participant.toString() !== userId) {
            io.to(participant.toString()).emit('messagesRead', { chatId, userId });
          }
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('typing', { chatId, userId });
    });

    // Stop typing indicator
    socket.on('stopTyping', ({ chatId, userId }) => {
      socket.to(chatId).emit('stopTyping', { chatId, userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

// Get the io instance
exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};