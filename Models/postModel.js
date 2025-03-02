import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    // Reference to the user who created the post
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the college where the post is made
    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Array of media URLs (images or videos)
    media: [
      {
        type: String,
      },
    ],
    upvotes: {
      type: Number,
      default: 0,
    },
    // Replies to this post
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
