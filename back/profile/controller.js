// Get individual user profile by ID
const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

// Get individual user profile by ID
const getUserProfile = async (req, res) => {
  const { id } = req.body; 

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find user by ID
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
  const { id } = req.body; 
  const { username, email, contactNumber, locationUrl, address, about } = req.body; // Get updated data from request body

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user profile with new values
    user.username = username || user.username;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;
    user.locationUrl = locationUrl || user.locationUrl;
    user.address = address || user.address;
    user.about = about || user.about;

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: 'User profile updated successfully.',
      user,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Fetch the data for business user by ID

const getBusinessUserProfile = async (req, res) => {
  const { id } = req.body; // Get business user ID from request body

  if (!id) {
    return res.status(400).json({ message: 'Business User ID is required.' });
  }

  try {
    // Find business user by ID
    const businessUser = await Business.findById(id).select('-password -__v'); // Exclude password and __v from the result
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
    const { id, username, email, contactNumber, businessType, locationUrl, about, address } = req.body;

    // Fetch current business
    const existingBusiness = await Business.findById(id);

    if (!existingBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if new username exists and belongs to a different user
    if (username && username !== existingBusiness.username) {
      const usernameExists = await Business.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Update fields
    existingBusiness.username = username || existingBusiness.username;
    existingBusiness.email = email || existingBusiness.email;
    existingBusiness.contactNumber = contactNumber || existingBusiness.contactNumber;
    existingBusiness.businessType = businessType || existingBusiness.businessType;
    existingBusiness.locationUrl = locationUrl || existingBusiness.locationUrl;
    existingBusiness.about = about || existingBusiness.about;
    existingBusiness.address = address || existingBusiness.address;

    await existingBusiness.save();

    res.status(200).json({ message: 'Profile updated successfully', business: existingBusiness });
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateUserProfile,
  getUserProfile,
  getBusinessUserProfile,
  updateBusinessProfile,
};