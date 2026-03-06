import express from "express";
import {
  createLivestock,
  deleteLivestock,
  getAllLivestock,
  getLivestockByFarmerId,
  getLivestockByFarmId,
  healthyanimalsforfarmer,
  updateLivestock,
} from "../controllers/Livestock.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();
router.get("/healthylivestocksforfarmer", verifyToken, healthyanimalsforfarmer);
router.post("/:farmId",verifyToken, createLivestock);
router.get("/", verifyToken,verifyAdmin,getAllLivestock);
router.get("/farmerlivestock", verifyToken, getLivestockByFarmerId);
router.get("/:farmId", verifyToken, getLivestockByFarmId);
router.put("/:livestockId", verifyToken, updateLivestock);
router.delete("/:livestockId", verifyToken, deleteLivestock);


export default router;
