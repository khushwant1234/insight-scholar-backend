import { Post } from "../Models/postModel.js";
import { College } from "../Models/collegeModel.js";
import { User } from "../Models/userModel.js"; // Added to update user stats
import { Upvote } from "../Models/upvoteModel.js"; // Import the new Upvote model
import { checkAndUpdateMentorStatus } from "../utils/mentorUtils.js";

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

    // Update the user's stats AND add 5 karma for posting
    await User.findByIdAndUpdate(author, { 
      $inc: { 
        "stats.questionsAsked": 1,
        karma: 5  // Add 5 karma for posting
      } 
    });
    
    // Check if user should become a mentor
    await checkAndUpdateMentorStatus(author);

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
    res.json({success: true, updatedPost});
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

    // Delete all upvotes for this post
    await Upvote.deleteMany({ post: id });

    // Use deleteOne() instead of remove()
    await post.deleteOne();

    // Decrease karma by 5 when post is deleted
    await User.findByIdAndUpdate(post.author, { 
      $inc: { 
        "stats.questionsAsked": -1,
        karma: -5  // Remove karma gained from posting
      } 
    });
    
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

// Modify updatePostUpvotes function
const updatePostUpvotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { upvoteChange, userId } = req.body;

    if (typeof upvoteChange !== "number" || !userId) {
      return res.status(400).json({success: false, error: "Invalid request parameters" });
    }

    // Find the post and the user
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({success: false, error: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({success: false, error: "User not found" });
    }

    // Get the post author (to update their karma)
    const postAuthor = await User.findById(post.author);
    if (!postAuthor) {
      return res.status(404).json({success: false, error: "Post author not found" });
    }

    // Check if the user has already upvoted this post
    const existingUpvote = await Upvote.findOne({ user: userId, post: id });

    if (upvoteChange > 0) {
      // Check if user has already upvoted this post
      if (existingUpvote) {
        return res.status(400).json({success: false, error: "User has already upvoted this post" });
      }
      
      // Create a new upvote document
      await Upvote.create({ user: userId, post: id });
      
      // Update post's upvote counter
      post.upvotes += 1;
      
      // Give karma to author (only if not self-upvoting)
      if (postAuthor._id.toString() !== userId) {
        postAuthor.karma += 2;
        await postAuthor.save();
        console.log("Karma added to author:", postAuthor.karma);
        
        // Check if author should become a mentor
        await checkAndUpdateMentorStatus(postAuthor._id);
      }
    } else if (upvoteChange < 0) {
      // Check if the user had upvoted this post
      if (!existingUpvote) {
        return res.status(400).json({success: false, error: "User has not upvoted this post" });
      }
      
      // Remove the upvote document
      await Upvote.findOneAndDelete({ user: userId, post: id });
      
      // Update post's upvote counter
      post.upvotes -= 1;
      
      // Remove karma from author (only if not self-upvoting)
      if (postAuthor._id.toString() !== userId) {
        postAuthor.karma = Math.max(0, postAuthor.karma - 2);
        await postAuthor.save();
        console.log("Karma removed from author:", postAuthor.karma);
      }
    }

    // Save the post after updating upvote count
    await post.save();

    // Get user's upvoted posts for the response
    const userUpvotedPosts = await Upvote.find({ user: userId }).select('post');
    const upvotedPostIds = userUpvotedPosts.map(upvote => upvote.post.toString());

    // Return only necessary data
    res.json({ 
      success: true, 
      upvotes: post.upvotes,
      upvotedPosts: upvotedPostIds // Return a list of post IDs the user has upvoted
    });
  } catch (error) {
    console.error("Error updating post upvotes:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get top 3 posts by upvotes
const getTopPosts = async (req, res) => {
  try {
    const topPosts = await Post.find({})
      .sort({ upvotes: -1 }) // Sort in descending order by upvotes
      .limit(3) // Limit to 3 posts
      .populate("author", "name profilePic")
      .populate("college", "name");
    
    res.json({ 
      success: true, 
      topPosts 
    });
  } catch (error) {
    console.error("Error fetching top posts:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByCollege, 
  getPostById, 
  getPostsByUser,
  updatePostUpvotes,
  getTopPosts,
  
};