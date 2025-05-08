import express, { application } from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './Config/MongoDB.js';
import authRouter from './Routes/AuthRouter.js';
import userRouter from './Routes/UserRouter.js';
import collegeRouter from './Routes/CollegeRouter.js';
import postRouter from './Routes/postRouter.js';
import replyRouter from './Routes/replyRouter.js';
// import paymentRouter from './Routes/PaymentRouter.js';
import mentorRequestRouter from "./Routes/MentorRequestRouter.js";
import chatRouter from './Routes/chatRouter.js';
import upvoteRouter from './Routes/upvoteRouter.js';
// import mongoose from 'mongoose';
import cron from 'node-cron';
// import { getUnUpdatedColleges } from './Controllers/testController.js';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { ChatMessage } from './Models/chatModel.js';
import { User } from './Models/userModel.js';

const app = express();
const PORT = process.env.PORT || 8000;
const corsOptions = {
  origin: "*" || process.env.FRONTEND_URL,
  credentials: true,
  methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ],
  allowedHeaders: [ 'Content-Type', 'Authorization' ]
};
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

    
    // Socket.io connection handler
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // Join the global chat room
      socket.join('global');
      
      // Listen for new messages
      socket.on('sendMessage', async ({ userId, message }) => {
        try {
          // Fetch user from database
          const user = await User.findById(userId);
          if (!user) return;
          
          // Create and save message in database
          const newMessage = new ChatMessage({
            sender: userId,
            content: message,
            type: 'text'
          });
          
          await newMessage.save();
          
          // Populate sender details
          await newMessage.populate('sender', 'name profilePic');
          
          // Broadcast to all clients
          io.to('global').emit('message', {
            _id: newMessage._id,
            content: newMessage.content,
            sender: {
              _id: user._id,
              name: user.name,
              profilePic: user.profilePic
            },
            createdAt: newMessage.createdAt
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
    
    // Use httpServer instead of app.listen
    httpServer.listen(PORT, () => {
      console.log(`Server running on the port ${PORT}`);
    });

// Schedule a job to clean up old messages every hour
cron.schedule('0 * * * *', async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await ChatMessage.deleteMany({
      createdAt: { $lt: tenMinutesAgo }
    });
    console.log(`Cleaned up ${result.deletedCount} old messages`);
  } catch (error) {
    console.error('Error cleaning up old messages:', error);
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
connectDB();

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/college', collegeRouter);
app.use('/api/post', postRouter);
app.use('/api/reply', replyRouter);
// app.use('/api/payments', paymentRouter);
app.use("/api/mentor-requests", mentorRequestRouter);
app.use('/api/chat', chatRouter);
app.use("/api/upvote", upvoteRouter);
// app.use("/api/test", getUnUpdatedColleges);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log(req.headers);
  next();
});


// app.listen(PORT, () => console.log("Server Started on PORT: " + PORT));