const jwt = require('jsonwebtoken');
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

const verifyToken = async (req, res, next) => {
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

    //console.log('Decoded token:', decoded); // For debugging only — remove in production

    let user;
    if (decoded.userType === 'User') {
      user = await User.findOne({ _id: decoded._id });
    } else  if (decoded.userType === 'businessUser') {
      user = await Business.findOne({ _id: decoded.id});
    }

    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = {
      user: user,
      userId: user._id,
      userType: decoded.userType
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired, please log in again' });
    }
    if (err.message === 'User not found') {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(400).json({ message: 'Authorization header is missing' });
//   }

//   if (!authHeader.startsWith('Bearer ')) {
//     return res.status(400).json({ message: 'Authorization header format is incorrect. Use "Bearer <token>"' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     console.log('Decoded token:', decoded); // For debugging only — remove in production

//     req.user = {
//       userId: decoded.id || decoded.userId,
//       userType: decoded.type || decoded.userType
//     };

//     next();
//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       return res.status(403).json({ message: 'Token expired, please log in again' });
//     }
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = verifyToken;
