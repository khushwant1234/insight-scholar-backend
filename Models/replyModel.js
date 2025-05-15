import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    // Reference to the user who made the reply
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the post that this reply belongs to
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
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
    // Add isAnonymous field
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Fake date fields for displaying historical dates
    displayCreatedAt: {
      type: Date,
      default: null,
    },
    displayUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Reply = mongoose.model("Reply", replySchema);
