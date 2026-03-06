import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("Please provide MONGODB_URI in the environment variables");
    }
    try {
       const connect= await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected",connect.connection.host);
    } catch (error) {
        console.log("MongoDB connection error",error);
    }
};


