const User = require('../userreg/modal'); // Adjust the path to your user model
const Business = require('../businessreg/modal'); // Adjust the path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginController = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update login history and count
    const loginTime = new Date();
    user.loginHistory.push(loginTime);
    user.loginCount += 1;
    await user.save();

    // Generate JWT token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      userType: 'User', // Hardcoded userType
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id,
      userType: 'User', // Hardcoded userType
      ...user.toObject(), // Include other user data, but exclude password
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const businessLoginController = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required.' });
  }

  try {
    const user = await Business.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update login history and count
    const loginTime = new Date();
    user.loginHistory.push(loginTime);
    user.loginCount += 1;
    await user.save();

    // Generate JWT token for business user
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      userType: 'businessUser', // Hardcoded userType
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(200).json({
      message: 'Business Login successful',
      token,
      userId: user._id,
      userType: 'businessUser', // Hardcoded userType
      ...user.toObject(), // Include other business data, exclude password
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutController = async (req, res) => {
  const { userId, userType } = req.body;

  try {
    const userModel = userType === 'businessUser' ? Business : User;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update logout history and count
    const logoutTime = new Date();
    user.logoutHistory.push(logoutTime);
    user.logoutCount += 1;
    await user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginController,
  businessLoginController,
  logoutController,
};
