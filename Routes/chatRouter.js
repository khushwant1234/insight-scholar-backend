import express from 'express';
import { getChatHistory } from '../Controllers/chatController.js';
import { protect } from '../Middlewares/auth.js';

const router = express.Router();

// Get chat history (protected)
router.get('/history', protect, getChatHistory);
console.log("chatRouter.js");

export default router;