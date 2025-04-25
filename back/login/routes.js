const express = require('express');
const router = express.Router();

const { loginController, businessLoginController } = require('./controller');

router.post('/login', loginController);
router.post('/businesslogin', businessLoginController);

module.exports = router;
