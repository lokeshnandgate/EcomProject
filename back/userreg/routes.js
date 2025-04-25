const express = require('express');
const router = express.Router();
const { registerController } = require('./controller');

// router.post('/login', loginController);
router.post('/register', registerController);

module.exports = router;
