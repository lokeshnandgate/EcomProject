// backend/routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
// IMPORTANT: This path was likely incorrect. Assuming 'controllers' is a sibling directory to 'routes'.
const { logoutUser } = require('./controller'); // <--- CORRECTED PATH HERE

// Define the POST route for logout: '/logout' will be appended to the base path
router.post('/logout', logoutUser);

module.exports = router;