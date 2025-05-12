const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const userloginRoutes = require('./login/routes');
const businessRoutes = require('./businessreg/routes');
const productRoutes = require('./product/routes');
const userregRoutes = require('./userreg/routes');
const profileRoutes = require('./profile/routes');
const authRoutes = require('./logout/routes');
const chatRoutes = require('./chat/routes');
const Chat = require('./chat/modal'); 
const searchUsers= require('./search/routes');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // allow all origins or specify frontend host
    methods: ['GET', 'POST']
  }
});

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
app.use('/api/logout', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchUsers);
// WebSocket events
let users = {}; // Store active users and their socket IDs

io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  // Register the user with their userId
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log('User registered:', userId, socket.id);
  });

  // Handle message sending
  socket.on('sendMessage', async (data) => {
    const { senderId, senderType, receiverId, receiverType, message, groupId } = data;

    try {
      const newMessage = new Chat({
        senderId,
        senderType,
        receiverId,
        receiverType,
        message,
        groupId: groupId || null,
      });

      await newMessage.save();

      // Emit to receiver if online
      if (users[receiverId]) {
        io.to(users[receiverId]).emit('receiveMessage', newMessage);
      } else {
        console.log('Receiver not online:', receiverId);
      }

      console.log('Message sent:', newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
