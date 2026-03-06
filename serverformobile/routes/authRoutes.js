import express from "express";
import {
  changePassword,
  getAllUser,
  Login,
  Register,
  sendResetOTP,
  UpdateProfile,
  verifyOTPAndResetPassword,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/forgot-password",sendResetOTP);
router.post("/reset-password",verifyOTPAndResetPassword);
router.get("/all",verifyToken,verifyAdmin, getAllUser);
router.put("/update",verifyToken,UpdateProfile);
router.put("/changepassword",verifyToken,changePassword);

export default router;
