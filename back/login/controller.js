const User = require('../userreg/modal'); // Adjust path if needed
const Business = require('../businessreg/modal'); // Adjust path if needed
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
const userRegisterController = async (req, res) => {
  const { username, email, password, contact, about } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      contact,
      about,
      loginHistory: [],
      logoutHistory: [],
      loginCount: 0,
      logoutCount: 0,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username, email, userType: 'User' },
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: newUser._id,
      userType: 'User',
      ...newUser.toObject(),
    });
  } catch (err) {
    console.error('User Registration Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Business Registration
const businessRegisterController = async (req, res) => {
  const {
    username,
    email,
    password,
    businessType,
    location,
    address,
    contact,
    about,
  } = req.body;

  if (!username || !email || !password || !businessType) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    const existingBusiness = await Business.findOne({ $or: [{ email }, { username }] });
    if (existingBusiness) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = new Business({
      username,
      email,
      password: hashedPassword,
      businessType,
      location,
      address,
      contact,
      about,
      loginHistory: [],
      logoutHistory: [],
      loginCount: 0,
      logoutCount: 0,
    });

    await newBusiness.save();

    const token = jwt.sign(
      { id: newBusiness._id, username, email, userType: 'businessUser' },
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(201).json({
      message: 'Business registered successfully',
      token,
      userId: newBusiness._id,
      userType: 'businessUser',
      ...newBusiness.toObject(),
    });
  } catch (err) {
    console.error('Business Registration Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// User Login
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

    const loginTime = new Date();
    user.loginHistory.push(loginTime);
    user.loginCount += 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, userType: 'User' },
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id,
      userType: 'User',
      ...user.toObject(),
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Business Login
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

    const loginTime = new Date();
    user.loginHistory.push(loginTime);
    user.loginCount += 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, userType: 'businessUser' },
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(200).json({
      message: 'Business Login successful',
      token,
      userId: user._id,
      userType: 'businessUser',
      ...user.toObject(),
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout (User or Business)
const logoutController = async (req, res) => {
  const { userId, userType } = req.body;

  try {
    const userModel = userType === 'businessUser' ? Business : User;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
  userRegisterController,
  businessRegisterController,
  loginController,
  businessLoginController,
  logoutController,
};
