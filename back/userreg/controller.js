const User = require('./modal'); // Corrected: consistent naming
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Access the secret from the environment variable
      { expiresIn: '1000h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id, // Send back only the ID.  Don't send the whole user object
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerController,
};