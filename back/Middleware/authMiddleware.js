
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ message: 'Authorization header is missing' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'Authorization header format is incorrect. Use "Bearer <token>"' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;