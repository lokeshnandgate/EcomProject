const express = require('express');
const router = express.Router();
const chatController = require('./controller');
const verifyToken = require('../Middleware/authMiddleware');

// Create or get chat room
router.post('/rooms', verifyToken, chatController.createOrGetChatRoom);

// Send message
router.post('/messages', verifyToken, chatController.sendMessage);

// Get messages for a chat room
router.get('/messages/:chatRoomId', verifyToken, chatController.getMessages);

// Update message status
router.put('/messages/:messageId/status', verifyToken, chatController.updateMessageStatus);

// Update typing status
router.put('/typing', verifyToken, chatController.updateTypingStatus);

// Update last seen
router.put('/last-seen', verifyToken, chatController.updateLastSeen);

// Get user's chat rooms
router.get('/rooms', verifyToken, chatController.getUserChatRooms);

module.exports = router;