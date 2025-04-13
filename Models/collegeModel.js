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
    // College metrics with both rating (0-5) and description
    metrics: {
      safety: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      healthcare: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      qualityOfTeaching: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      campusCulture: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      studentSupport: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      affordability: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
      },
      placements: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        description: {
          type: String,
          default: ""
        }
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