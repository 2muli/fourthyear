import express from "express";
import {
  createFarm,
  getAllFarms,
  getFarmsByFarmerId,
  updateFarm,
  deleteFarm,
} from "../controllers/FarmController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";
const router = express.Router();
router.post("/",verifyToken, createFarm);
router.get("/", verifyToken,verifyAdmin, getAllFarms);
router.get("/farmerfarms", verifyToken, getFarmsByFarmerId);
router.put("/:id", verifyToken, updateFarm);
router.delete("/:id", verifyToken, deleteFarm);
export default router;
