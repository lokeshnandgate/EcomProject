
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');
const { compare } = require('bcryptjs');

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

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({ message: 'Login successful', user });
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

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  res.status(200).json({ message: 'Business Login successful', user });
} catch (err) {
  console.error('Login Error:', err);
  res.status(500).json({ message: 'Server error' });
}
};

module.exports = {
  loginController,
  businessLoginController
};
