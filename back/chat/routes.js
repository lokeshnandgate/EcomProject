const express = require('express');
const { sendMessage, getChatHistory,getUserList } = require('./controller');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST: Send a message (secured)
router.post('/send', verifyToken, sendMessage);

// GET: Fetch chat history (optional: secure this too)
router.get('/history/receive', verifyToken, getChatHistory);
router.get('/userlist',getUserList)
module.exports = router;
