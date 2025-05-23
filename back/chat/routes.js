const express = require('express');
const router = express.Router();
const messageController = require('./messagecontroller');
const chatController = require('./chatcontroller');
const verifyToken = require('../Middleware/authMiddleware');

// Message routes
router.post('/messages/sendmessage', verifyToken, messageController.sendMessage);
router.get('/messages/:chatId/getmessage', verifyToken, messageController.getMessages);
//router.post('/messages/:messageId/readmessage', verifyToken, messageController.markAsRead);
router.post('/messages/mark-as-read', verifyToken, messageController.markAsRead);
router.delete('/messages/:messageId/deletemessage', verifyToken, messageController.deleteMessage);
router.put('/messages/:messageId/editmessage', verifyToken, messageController.editMessage);
router.post('/messages/:messageId/reactmessage', verifyToken, messageController.reactToMessage);

// Chat routes
router.post('/chats/createchat', verifyToken, chatController.createChat);
router.get('/chats/getuserchats', verifyToken, chatController.getUserChats);
router.get('/chats/:chatId/getchatdetail', verifyToken, chatController.getChatDetails);
router.put('/chats/:chatId/updategroupchat', verifyToken, chatController.updateGroupChat);
router.post('/chats/:chatId/addparticipants', verifyToken, chatController.addParticipants);
router.delete('/chats/:chatId/participants/:participantId/removeparticipant', verifyToken, chatController.removeParticipant);
router.post('/chats/:chatId/leavegroup', verifyToken, chatController.leaveGroup);
router.delete('/chats/:chatId/deletechat', verifyToken, chatController.deleteChat);
router.get('/chats/search/:query', verifyToken, chatController.searchUsersAndBusiness);

module.exports = router;