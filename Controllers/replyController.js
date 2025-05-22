import { Reply } from "../Models/replyModel.js";
import { User } from "../Models/userModel.js";
import { Post } from "../Models/postModel.js";
// import { checkAndUpdateMentorStatus } from "../utils/mentorUtils.js";

// Create a new reply without fake historical dates
const createReply = async (req, res) => {
  try {
    const { author, post, content, media, isAnonymous } = req.body;

    // Basic validation: author, post and content are required
    if (!author || !post || !content) {
      return res.status(400).json({ error: "Author, post, and content are required" });
    }

    // Find the post being replied to
    const parentPost = await Post.findById(post);
    if (!parentPost) {
      return res.status(404).json({ error: "Parent post not found" });
    }

    // Create reply with standard fields only
    const reply = await Reply.create({ 
      author, 
      post, 
      content, 
      media,
      isAnonymous: isAnonymous || false // Include the isAnonymous field
    });
    
    // Add reply to post's replies array
    await Post.findByIdAndUpdate(post, { $push: { replies: reply._id } });
    
    // Update only the stats counter, not karma
    await User.findByIdAndUpdate(author, { 
      $inc: { 
        "stats.answersGiven": 1
      }
    });

    res.status(201).json({ success: true, reply });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing reply
const updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media } = req.body;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // (Optional) Add authorization check here to ensure the user is allowed to update the reply

    if (content) reply.content = content;
    if (media) reply.media = media;

    const updatedReply = await reply.save();
    res.json(updatedReply);
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete an existing reply
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Remove reply from post's replies array
    await Post.findByIdAndUpdate(reply.post, { $pull: { replies: reply._id } });
    
    // Update only the stats counter, not karma
    await User.findByIdAndUpdate(reply.author, { 
      $inc: { 
        "stats.answersGiven": -1
      }
    });

    await reply.deleteOne();
    res.json({ message: "Reply removed successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all replies for a specific post
const getRepliesByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const replies = await Reply.find({ post: postId }).populate("author", "name profilePic");
    res.json({success: true, replies});
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// New controller to update the upvotes for a reply
const updateReplyUpvotes = async (req, res) => {
  try {
    const { id } = req.params;
    // Expecting a numeric value for upvoteChange (e.g., 1 to upvote, -1 to downvote)
    const { upvoteChange } = req.body;

    if (typeof upvoteChange !== "number") {
      return res.status(400).json({ error: "Invalid upvote change value" });
    }

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    reply.upvotes += upvoteChange;
    const updatedReply = await reply.save();
    res.json(updatedReply);
  } catch (error) {
    console.error("Error updating reply upvotes:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { createReply, updateReply, deleteReply, getRepliesByPost, updateReplyUpvotes };