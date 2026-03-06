import express from "express";
import {
  CreateCrop,
  deleteCrop,
  getAllCrops,
  getAllCropsByFarmer,
  updateCrop,
} from "../controllers/cropController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/addcrop/:farmId", verifyToken, CreateCrop);
router.get("/farmercrops", verifyToken, getAllCropsByFarmer);
router.get("/allcrops", verifyToken, verifyAdmin, getAllCrops);
router.put("/update/:id", verifyToken, updateCrop);
router.delete("/delete/:id", verifyToken, deleteCrop);

export default router;
