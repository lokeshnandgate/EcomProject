const express = require('express');
const { sendMessage, getChatHistory } = require('./controller');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST: Send a message (secured)
router.post('/send', verifyToken, sendMessage);

// GET: Fetch chat history (optional: secure this too)
router.get('/history/receive', verifyToken, getChatHistory);

module.exports = router;
