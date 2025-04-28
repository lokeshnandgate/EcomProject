
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const userloginRoutes = require('./login/routes');
const businessRoutes = require('./businessreg/routes');
const productRoutes = require('./product/routes');
const userregRoutes = require('./userreg/routes');
const getUserProfile = require('./profile/routes');
const updateUserProfile = require('./profile/routes');
const getBusinessUserProfile = require('./profile/routes');
const updateBusinessProfile = require('./profile/routes');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;


// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware
app.use(cors());
console.log("first")
// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo error:', error.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/login', userloginRoutes);
app.use('/api/businessreg', businessRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/userreg', userregRoutes);
app.use('/api/uprofile',getUserProfile)
app.use('/api/updateuser',updateUserProfile)
app.use('/api/bprofile',getBusinessUserProfile)
app.use('/api/updatebusiness', updateBusinessProfile)

// Start the server after DB connection
connectDB().then(() => {
  app.listen(3001, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

