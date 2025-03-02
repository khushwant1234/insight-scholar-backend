import { Post } from "../Models/postModel.js";
import { College } from "../Models/collegeModel.js";

// Create a new post
const createPost = async (req, res) => {
  try {
    const { author, college, content, media } = req.body;

    // Basic validation: author, college and content are required
    if (!author || !college || !content) {
      return res.status(400).json({ error: "Author, college, and content are required" });
    }
    
    // Check content length (maximum 300 characters)
    if (content.length > 300) {
      return res.status(400).json({ error: "Post content cannot exceed 300 characters" });
    }

    const post = await Post.create({ author, college, content, media });

    // Update the college document: push the new post's ID into the posts field
    await College.findByIdAndUpdate(college, { $push: { posts: post._id } });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }


    // Check content length if content is provided
    if (content && content.length > 300) {
      return res.status(400).json({ error: "Post content cannot exceed 300 characters" });
    }

    // (Optional) Add authorization check here to ensure the user is allowed to update the post
    if (content) post.content = content;
    if (media) post.media = media;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete an existing post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Use deleteOne() instead of remove()
    await post.deleteOne();
    res.json({ message: "Post removed successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all posts for a specific college
const getPostsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const posts = await Post.find({ college: collegeId })
      .populate("author", "name profilePic");
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "name profilePic")
      .populate({
        path: "replies",
        populate: { path: "author", select: "name profilePic" },
      });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all posts for a particular user
const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .populate("author", "name profilePic")
      .populate("college", "name");
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts for user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// New controller to update the upvotes for a post
const updatePostUpvotes = async (req, res) => {
  try {
    const { id } = req.params;
    // Expecting a numeric value for upvoteChange (e.g., 1 to upvote, -1 to downvote)
    const { upvoteChange } = req.body;

    if (typeof upvoteChange !== "number") {
      return res.status(400).json({ error: "Invalid upvote change value" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.upvotes += upvoteChange;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post upvotes:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByCollege, 
  getPostById, 
  getPostsByUser,
  updatePostUpvotes
};