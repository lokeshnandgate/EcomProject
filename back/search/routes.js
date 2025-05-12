const express = require('express');
const router = express.Router();
const { searchUsers } = require('./controller');
const authMiddleware = require('../Middleware/authMiddleware');
router.post('/search-users',authMiddleware, searchUsers);

module.exports = router;
