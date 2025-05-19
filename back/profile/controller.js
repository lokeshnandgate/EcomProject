// controllers/profileController.js
const User = require('../userreg/modal'); // Assuming userreg/modal is the correct path for User model
const Business = require('../businessreg/modal'); // Assuming businessreg/modal is the correct path for Business model

// Helper function to validate image format (optional, but good practice)
const isValidImageFormat = (imageData) => {
  return imageData && imageData.startsWith('data:image/');
};

// Get individual user profile by ID
const getUserProfile = async (req, res) => {
  const { id } = req.body; // Consider using req.params.id if ID is passed in the URL

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const user = await User.findById(id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully.',
      user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user profile by ID
const updateUserProfile = async (req, res) => {
  try {
    const { id, profilePic, ...updateData } = req.body; // Get ID and other updated data from request body

    if (!id) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Validate profilePic if provided
    if (profilePic && !isValidImageFormat(profilePic)) {
      return res.status(400).json({ message: 'Invalid image format. Profile picture must be a base64 encoded image.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, profilePic }, // Apply all updates including profilePic
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select('-password -__v'); // Exclude sensitive fields from the response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Fetch the data for business user by ID
const getBusinessUserProfile = async (req, res) => {
  const { id } = req.body; // Consider using req.params.id if ID is passed in the URL

  if (!id) {
    return res.status(400).json({ message: 'Business User ID is required.' });
  }

  try {
    const businessUser = await Business.findById(id).select('-password -__v');
    if (!businessUser) {
      return res.status(404).json({ message: 'Business User not found.' });
    }

    res.status(200).json({
      message: 'Business User profile fetched successfully.',
      businessUser,
    });
  } catch (error) {
    console.error('Error fetching business user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateBusinessProfile = async (req, res) => {
  try {
    const { id, profilePic, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Business ID is required.' });
    }

    // Validate profilePic if provided
    if (profilePic && !isValidImageFormat(profilePic)) {
      return res.status(400).json({ message: 'Invalid image format. Profile picture must be a base64 encoded image.' });
    }

    // Check if new username exists and belongs to a different user (only if username is part of updateData)
    if (updateData.username) {
      const existingBusiness = await Business.findById(id);
      if (existingBusiness && updateData.username !== existingBusiness.username) {
        const usernameExists = await Business.findOne({ username: updateData.username });
        if (usernameExists) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { ...updateData, profilePic },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', business: updatedBusiness });
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a combined user or business profile by ID
const getProfile = async (req, res) => {
  const { id } = req.body; // Consider using req.params.id if ID is passed in the URL

  if (!id) {
    return res.status(400).json({ message: 'ID is required.' });
  }

  try {
    // Attempt to find as a regular user
    const user = await User.findById(id).select('-password -__v');
    if (user) {
      return res.status(200).json({
        message: 'User profile fetched successfully.',
        type: 'user',
        profile: user,
      });
    }

    // If not a regular user, attempt to find as a business user
    const businessUser = await Business.findById(id).select('-password -__v');
    if (businessUser) {
      return res.status(200).json({
        message: 'Business User profile fetched successfully.',
        type: 'business',
        profile: businessUser,
      });
    }

    // If neither is found
    return res.status(404).json({ message: 'Profile not found.' });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  updateUserProfile,
  getUserProfile,
  getBusinessUserProfile,
  updateBusinessProfile,
  getProfile,
};