const User = require('../userreg/modal');
const Business = require('../businessreg/modal');

const searchUsers = async (req, res) => {
  try {
    // Check if req.user exists (from verifyToken middleware)
   
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user information found'
      });
    }

    // Safely get user info with defaults
    const requestingUserId = req.user.userId || req.user.id; // Try both common patterns
    const requestingUserType = req.user.userType;
    
    if (!requestingUserId || !requestingUserType) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing user identity information'
      });
    }

    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required for search'
      });
    }

    const [regularUsers, businessUsers] = await Promise.all([
      User.find({ 
        username: { $regex: username, $options: 'i' },
        _id: { $ne: requestingUserId } // Using _id instead of id if that's your field
      }).select('-password -loginHistory -logoutHistory -__v'),
      
      Business.find({ 
        username: { $regex: username, $options: 'i' },
        _id: { $ne: requestingUserId } // Using _id instead of id if that's your field
      }).select('-password -loginHistory -logoutHistory -__v')
    ]);

    const combinedResults = [
      ...regularUsers.map(user => ({ 
        ...user._doc, 
        userType: 'User',
        isSameType: requestingUserType === 'User'
      })),
      ...businessUsers.map(business => ({ 
        ...business._doc, 
        userType: 'businessUser',
        isSameType: requestingUserType === 'businessUser'
      }))
    ];

    res.status(200).json({
      success: true,
      users: combinedResults
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching users'
    });
  }
};

module.exports = { searchUsers };