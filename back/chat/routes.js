const express = require('express');
const router = express.Router();
const chatController = require('./controller');
const authMiddleware = require('../Middleware/authMiddleware');

router.post('/addNewChatEntry', authMiddleware, chatController.create);
router.post('/addNewMessage', authMiddleware, chatController.addNewMessage);
router.post('/getRooms', authMiddleware, chatController.getRooms);
router.post('/findRoomOf2Users', authMiddleware, chatController.findRoomOf2Users);
router.post('/markRead', authMiddleware, chatController.markMessageAsRead);
router.post('/unreadMessagesCount', authMiddleware, chatController.unreadMessagesCount);

module.exports = router;