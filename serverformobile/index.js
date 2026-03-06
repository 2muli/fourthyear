import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import cropRoutes from "./routes/cropRoutes.js"
import livestockRoutes from "./routes/liveStockRoutes.js"
import farmRoutes from "./routes/farmRoutes.js"
import chatRoute from "./routes/chatRoutes.js"
import cropDiseasePrediction from "./routes/cropDiseasePredict.js"
import activityRoutes from "./routes/activityRoutes.js"
const app = express();
const port = process.env.PORT || 8800;

app.use(cors());
app.use(express.json({ limit: "10mb" })); //limit all json data to 10mb more so for images
app.use(express.urlencoded({ limit: "10mb", extended: true })); //limit all urlencoded data to 10mb more so for images

//connect to db
connectDB();

//routes
app.use("/api/auth", authRoutes);
app.use('/api/crop',cropRoutes)
app.use('/api/livestock',livestockRoutes)
app.use('/api/farm',farmRoutes)
app.use('/api/chat',chatRoute)
app.use("/api",cropDiseasePrediction)
app.use("/api/activity",activityRoutes)

app.listen(port, () => console.log(`Server running on port ${port}`));
