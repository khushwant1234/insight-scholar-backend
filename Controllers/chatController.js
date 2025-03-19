import { ChatMessage } from '../Models/chatModel.js';

export const getChatHistory = async (req, res) => {
  try {
    // Only get messages from the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const messages = await ChatMessage.find({
      createdAt: { $gte: tenMinutesAgo }
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePic')
      .lean();
    
    res.json({
      success: true,
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch chat history' 
    });
  }
};