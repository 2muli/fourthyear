import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()
const verifyAdmin = async (req, res, next) => {
  try {
    // Try to get token from cookies OR Authorization header
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Ensure role is case-insensitive
    if (user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // Attach user to request for later use if needed
    req.user = user;

    next();
  } catch (error) {
    console.error("Error verifying admin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default verifyAdmin;
