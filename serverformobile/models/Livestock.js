import mongoose from "mongoose";

const LivestockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true
    },
    breed: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    
    healthStatus: {
      type: String,
      enum: ["Healthy", "Sick", "Quarantine", "Pending"],
      required: true
    }
  },
  { timestamps: true }
);

const Livestock = mongoose.model("Livestock", LivestockSchema);
export default Livestock;
