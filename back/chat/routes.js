const express = require('express');
const router = express.Router();
const chatController = require('./controller');
const verifyToken = require('../middleware/authMiddleware');

// Access or create chat
router.post('/accessChat', verifyToken, chatController.accessChat);

// Create group chat
router.post('/group', verifyToken, chatController.createGroupChat);

// Get all chats for user
router.get('/getUserChat', verifyToken, chatController.getUserChats);

// Get single chat
router.get('/:chatId', verifyToken, chatController.getChat);

// Add to group
router.post('/group/add', verifyToken, chatController.addToGroup);

// Remove from group
router.post('/group/remove', verifyToken, chatController.removeFromGroup);

module.exports = router;