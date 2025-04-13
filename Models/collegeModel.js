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
    // Add this new field for email domains
    emailDomains: {
      type: [String],
      default: [],
      description: "List of allowed email domains for this college"
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
    // College metrics ratings (1-5 scale)
    metrics: {
      safety: {
        type: Number,
        min: 1,
        max: 5,
      },
      healthcare: {
        type: Number,
        min: 1,
        max: 5,
      },
      qualityOfTeaching: {
        type: Number,
        min: 1,
        max: 5,
      },
      campusCulture: {
        type: Number,
        min: 1,
        max: 5,
      },
      studentSupport: {
        type: Number,
        min: 1,
        max: 5,
      },
      affordability: {
        type: Number,
        min: 1,
        max: 5,
      },
      placements: {
        type: Number,
        min: 1,
        max: 5,
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
