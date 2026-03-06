import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
});

const ML_API = "http://127.0.0.1:8000/predict";

router.post("/predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(ML_API, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.status(200).json(response.data);

  } catch (error) {
    console.error("Prediction error:", error.message);

    res.status(500).json({
      error: "Prediction failed",
      details: error.message,
    });
  }
});

export default router;