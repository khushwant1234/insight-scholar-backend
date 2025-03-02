import { Reply } from "../Models/replyModel.js";

// Create a new reply
const createReply = async (req, res) => {
  try {
    const { author, post, content, media } = req.body;

    // Basic validation: author, post and content are required
    if (!author || !post || !content) {
      return res.status(400).json({ error: "Author, post, and content are required" });
    }

    const reply = await Reply.create({ author, post, content, media });
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

    // (Optional) Add authorization check here to ensure the user is allowed to delete the reply

    await reply.remove();
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