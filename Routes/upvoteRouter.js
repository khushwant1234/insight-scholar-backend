import express from "express";
import { Upvote } from "../Models/upvoteModel.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Get all upvotes by a user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    // console.log("Fetching user upvotes...");
    const { userId } = req.params;
    const upvotes = await Upvote.find({ user: userId });
    res.json({ success: true, upvotes });
  } catch (error) {
    console.error("Error fetching user upvotes:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;