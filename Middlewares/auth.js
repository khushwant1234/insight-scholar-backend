import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  // Extract token from "Authorization" header formatted as "Bearer <token>"
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to req.user
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

export { protect };