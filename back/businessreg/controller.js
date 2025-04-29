const Business = require('./modal');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerBusiness = async (req, res) => {
    try {
        const { username, email, password, businessType } = req.body;

        if (!username || !email || !password || !businessType) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await Business.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newBusiness = new Business({
            username,
            email,
            password: hashedPassword,
            businessType,
            userType: 'businessUser', // Explicitly set userType for business users
        });
        await newBusiness.save();

        // Generate JWT token
        const payload = {
            id: newBusiness._id,
            username: newBusiness.username,
            userType: newBusiness.userType, // Include userType in the payload
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Use the secret key from environment variables
            { expiresIn: '1000h' }
        );

        return res.status(201).json({
            message: 'Business registered successfully.',
            token,
            id: newBusiness._id, // Include the generated ID in the response
        });
    } catch (error) {
        console.error('Error registering business:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { registerBusiness };