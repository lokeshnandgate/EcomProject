// routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
const { logoutUser } = require('./controller'); // Adjust path as needed

router.post('/logout', logoutUser);

module.exports = router;