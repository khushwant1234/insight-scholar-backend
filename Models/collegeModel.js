import mongoose, { Schema } from "mongoose";

const collegeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String, // URL to an image representing the college
    },
    location: {
      type: String,
    },
    // Users who have joined this college page on your website
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
    },
    domain: {
      type: [String],
      default: [],
    },
    // Quick facts about the college
    facts: {
      founded: {
        type: Number, // Year the college was founded
      },
      totalStudents: {
        type: Number,
      },
      type: {
        type: String, // e.g., "Public", "Private", etc.
      },
    },
    // Posts (or questions/comments) posted on this college's page
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

export const College = mongoose.model("College", collegeSchema);
