import express from "express";
import { createReply, updateReply, deleteReply, getRepliesByPost, updateReplyUpvotes } from "../Controllers/replyController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Create a new reply (Protected)
router.post("/", protect, createReply);

// Update an existing reply (Protected)
router.put("/:id", protect, updateReply);

// Delete an existing reply (Protected)
router.delete("/:id", protect, deleteReply);

// Update reply upvotes (Protected)
router.put("/upvotes/:id", protect, updateReplyUpvotes);

// Get all replies for a specific post (Public or Protected as needed)
router.post("/post/:postId", getRepliesByPost);

export default router;