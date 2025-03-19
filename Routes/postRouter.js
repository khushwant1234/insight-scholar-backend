import express from "express";
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByCollege, 
  getPostById, 
  getPostsByUser,
  updatePostUpvotes,
  getTopPosts,
} from "../Controllers/postController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Create a new post (Protected)
router.post("/", protect, createPost);

// Get all posts for a specific college
router.post("/college/:collegeId", getPostsByCollege);

// Get all posts for a specific user
router.post("/user/:userId", getPostsByUser);

// Get a single post by ID, update and delete a specific post (Protected for update & delete)
router.route("/:id")
  .post(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// New: Update post upvotes (Protected)
// This route will update the upvotes for a post and update the user's upvotedPosts array.
router.put("/upvotes/:id", protect, updatePostUpvotes);

// Get top posts
router.get('/top', getTopPosts);

export default router;