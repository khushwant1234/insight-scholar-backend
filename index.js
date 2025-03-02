const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectDB = require("./Config/MongoDB.js");
const authRouter = require("./Routes/AuthRouter.js");
const userRouter = require("./Routes/UserRouter.js");
const collegeRouter = require("./Routes/CollegeRouter.js");
const postRouter = require("./Routes/postRouter.js");
const replyRouter = require("./Routes/replyRouter.js");

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
connectDB();

// Mount routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/college", collegeRouter);
app.use("/api/post", postRouter);
app.use("/api/reply", replyRouter);

app.get("/", (req, res) => {
  res.send("API is running on Vercel...");
});

app.listen(PORT, () => console.log("Server Started on PORT: " + PORT));

// Export the app for Vercel serverless functions
module.exports = app;