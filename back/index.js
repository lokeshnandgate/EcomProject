const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const userloginRoutes = require('./login/routes');
const businessRoutes = require('./businessreg/routes');
const productRoutes = require('./product/routes');
const userregRoutes = require('./userreg/routes');
const profileRoutes = require('./profile/routes');
const authRoutes = require('./logout/routes');
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => {
  console.error('Mongo error:', error.message);
  process.exit(1);
});

// Routes
app.use('/api/login', userloginRoutes);
app.use('/api/businessreg', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/userreg', userregRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});