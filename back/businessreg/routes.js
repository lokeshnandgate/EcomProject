const express = require('express');
const router = express.Router();
const { registerBusiness } = require('./controller');

router.post('/breg', registerBusiness);

module.exports = router;
