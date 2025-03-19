import { createServer } from 'http';
import { Server } from 'socket.io';
import { ChatMessage } from './Models/chatModel.js';
import { User } from './Models/userModel.js';
import upvoteRouter from "./Routes/upvoteRouter.js";

// Add this line with your other app.use statements
app.use("/api/upvote", upvoteRouter);

// Create HTTP server
const httpServer = createServer(app);

// Socket.io setup with CORS config
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB first
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
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
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });