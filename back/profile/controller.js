
// Get individual user profile by ID
const User = require('../userreg/modal'); // adjust path if different
const Business = require('../businessreg/modal'); // adjust path if different

// Get individual user profile by ID
const getUserProfile = async (req, res) => {
  const { id } = req.body; // Get user ID from request body

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find user by ID
    const user = await User.findById(id).select('-password -__v'); // Exclude password and __v from the result
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
  const { id } = req.body; // Get business ID from the request body
  const { username, email, contactNumber, locationUrl, address, about, businessType } = req.body; // Get updated data from request body

  if (!id) {
    return res.status(400).json({ message: 'Business ID is required.' });
  }

  try {
    // Find business by ID
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    // Update the business profile with new values
    business.username = username || business.username;
    business.email = email || business.email;
    business.contactNumber = contactNumber || business.contactNumber;
    business.locationUrl = locationUrl || business.locationUrl;
    business.address = address || business.address;
    business.about = about || business.about;
    business.businessType = businessType || business.businessType;

    // Save the updated business profile
    await business.save();

    res.status(200).json({
      message: 'Business profile updated successfully.',
      business,
    });
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

















module.exports = {
  updateUserProfile,
  getUserProfile,
  getBusinessUserProfile,
  updateBusinessProfile,
};
