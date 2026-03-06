import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv'

dotenv.config()
export const verifyToken = async (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken || typeof decodedToken === "string" || !(decodedToken).id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { id } = decodedToken;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Invalid token", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
export default verifyToken