// const tokenBlacklist = require('../utils/tokenBlacklist');
const tokenBlacklist = new Set();
exports.logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  tokenBlacklist.add(token);

  res.status(200).json({ message: 'User logged out successfully' });
};