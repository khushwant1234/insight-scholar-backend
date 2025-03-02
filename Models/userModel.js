import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String, // URL to the user's profile picture
      
    },
    // The college the user is primarily associated with
    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
    },
    major: {
      type: String,
    },
    year: {
      type: Number,
    },
    karma: {
      type: Number,
      default: 0,
    },
    // Engagement statistics
    stats: {
      questionsAsked: {
        type: Number,
        default: 0,
      },
      answersGiven: {
        type: Number,
        default: 0,
      },
      upvotes: {
        type: Number,
        default: 0,
      },
    },
    interests: [
      {
        type: String,
      },
    ],
    linkedIn: {
      type: String, // URL to LinkedIn profile
    },
    // Additional colleges the user has joined (if applicable)
    joinedColleges: [
      {
        type: Schema.Types.ObjectId,
        ref: "College",
      },
    ],
    // Mentor-related fields (a user becomes a mentor when they have sufficient karma)
    isMentor: {
      type: Boolean,
      default: false,
    },
    mentorDetails: {
      isAssigned: {
        type: Boolean,
        default: false,
      },
      assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      // You can add more fields (like hourly rate, availability, etc.) here if needed.
    },
  },
  { timestamps: true }
);

// Instance method to check if entered password matches hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash the password if it is modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const User = mongoose.model("User", userSchema);
