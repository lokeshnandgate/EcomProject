const express = require('express');
const router = express.Router();
const messageController = require('./controller');
const verifyToken = require('../middleware/authMiddleware');

// Send message
router.post('/', verifyToken, messageController.sendMessage);

// Get all messages for a chat
router.get('/:chatId', verifyToken, messageController.getMessages);

// Delete message
router.delete('/:messageId', verifyToken, messageController.deleteMessage);

module.exports = router;