const express = require('express');
const router = express.Router();
const { logoutUser } = require('./controller');

router.post('/logout', logoutUser);

module.exports = router;