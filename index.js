import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './Config/MongoDB.js';
import authRouter from './Routes/AuthRouter.js';
import userRouter from './Routes/UserRouter.js';
import collegeRouter from './Routes/CollegeRouter.js';
import postRouter from './Routes/postRouter.js';
import replyRouter from './Routes/replyRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
  methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ],
  allowedHeaders: [ 'Content-Type', 'Authorization' ]
};

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

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => console.log("Server Started on PORT: " + PORT));