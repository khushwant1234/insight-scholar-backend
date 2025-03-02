import express from "express";
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByCollege, 
  getPostById,
  getPostsByUser,
  updatePostUpvotes
} from "../Controllers/postController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Create a new post (Protected)
router.post("/", protect, createPost);

// Get all posts for a specific college
router.get("/college/:collegeId", getPostsByCollege);

// Get all posts for a specific user
router.get("/user/:userId", getPostsByUser);

// Get a single post by ID, update and delete a specific post (Protected for update & delete)
router.route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// New: Update post upvotes (Protected)
router.put("/upvotes/:id", protect, updatePostUpvotes);

export default router;