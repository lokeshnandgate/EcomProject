const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Needed for socket.io

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 3001;

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

// Import routes
const userloginRoutes = require('./login/routes');
const businessRoutes = require('./businessreg/routes');
const productRoutes = require('./product/routes');
const userregRoutes = require('./userreg/routes');
const profileRoutes = require('./profile/routes');
const authRoutes = require('./logout/routes');
const chatRoutes = require('./chat/routes');
const searchUsers = require('./search/routes');
const messageRoutes = require('./message/routes');
// Use routes
app.use('/api/login', userloginRoutes);
app.use('/api/businessreg', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/userreg', userregRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/logout', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchUsers);
app.use('/api/message', messageRoutes);
// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const { init } = require('./config/socket');
const { initializeSocket } = require('./sockets/chatSocket');
const io = init(server);

// Handle socket connection
io.on('connection', (socket) => {
  initializeSocket(socket);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
