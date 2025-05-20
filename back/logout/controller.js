const tokenBlacklist = new Set();

exports.logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Logout attempt received without a valid Bearer token header.');
    return res.status(400).json({ message: 'No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1];

  tokenBlacklist.add(token);
  console.log(`Token successfully blacklisted: ${token.substring(0, 10)}...[truncated]`); 
  res.status(200).json({ message: 'User logged out successfully' });
};

exports.checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (tokenBlacklist.has(token)) {
      console.warn('Attempt to use a blacklisted token detected.');
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
  }
  next(); 
};