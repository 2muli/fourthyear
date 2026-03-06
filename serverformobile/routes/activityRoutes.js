import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createActivity,
  fetchAllActivities,
  fetchAllActivitiesByFarmer,
  updateActivity,
  deleteActivity,
} from "../controllers/ActivityController.js";

const router = express.Router();

router.post("/", verifyToken, createActivity);
router.get("/farmer", verifyToken, fetchAllActivitiesByFarmer);
router.get("/all", verifyToken, fetchAllActivities);
router.put("/update/:id", verifyToken, updateActivity);
router.delete("/delete/:id", verifyToken, deleteActivity);
export default router;
