import mongoose, { Schema } from "mongoose";

const upvoteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

upvoteSchema.index({ user: 1, post: 1 }, { unique: true }); // Prevent duplicate upvotes

export const Upvote = mongoose.model("Upvote", upvoteSchema);