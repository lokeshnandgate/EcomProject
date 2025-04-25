const Business = require('./modal');
const bcrypt = require('bcryptjs');
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
            businessType 
        });
        await newBusiness.save();

        return res.status(201).json({ message: 'Business registered successfully.' });
    } catch (error) {
        console.error('Error registering business:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { registerBusiness };
