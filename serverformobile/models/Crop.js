import mongoose from "mongoose";

const CropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    farmerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    farmId: { type: mongoose.Schema.ObjectId, ref: "Farm", required: true },
    variety: { type: String, required: true },
    plantingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Planted", "Growing", "Flowering", "Harvested", "Failed"],
      required: true,
    },
  },
  { timestamps: true }
);

const Crop = mongoose.model("Crop", CropSchema);

export default Crop;
