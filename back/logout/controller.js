// controllers/logoutController.js
// const tokenBlacklist = require('../utils/tokenBlacklist'); // If you have a separate file for this
const tokenBlacklist = new Set(); // Define tokenBlacklist here if it's not imported

exports.logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // It's good practice to log this on the server side for debugging
    console.warn('Logout attempt without a valid Bearer token header.');
    return res.status(400).json({ message: 'No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1];

  // Invalidate the token by adding it to a blacklist
  // Note: For a production application, this Set will reset if the server restarts.
  // A more robust solution for token blacklisting (e.g., for JWTs) usually involves
  // storing it in a persistent database (Redis, MongoDB, etc.) with an expiration.
  tokenBlacklist.add(token);
  console.log(`Token added to blacklist: ${token.substring(0, 10)}...`); // Log a partial token for security

  res.status(200).json({ message: 'User logged out successfully' });
};