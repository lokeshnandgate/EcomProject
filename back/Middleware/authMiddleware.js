// const jwt = require('jsonwebtoken');

// exports.verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   // Check if the authorization header is missing
//   if (!authHeader) {
//     return res.status(400).json({ message: 'Authorization header is missing' });
//   }

//   // Check if the authorization header is formatted correctly (Bearer token)
//   if (!authHeader.startsWith('Bearer ')) {
//     return res.status(400).json({ message: 'Authorization header format is incorrect. Use "Bearer <token>"' });
//   }

//   // Extract the token from the authorization header
//   const token = authHeader.split(' ')[1];

//   try {
//     // Verify the token using the secret key
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach the decoded user data to the request object
//     next(); // Proceed to the next middleware/route handler
//   } catch (err) {
//     // If the token is invalid or expired
//     if (err.name === 'TokenExpiredError') {
//       return res.status(403).json({ message: 'Token expired, please log in again' });
//     }
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };
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