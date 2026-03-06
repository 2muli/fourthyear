import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: [
        "Mixed Farming",
        "Crop Farming",
        "Dairy",
        "Poultry",
        "Horticulture",
        "Fish Farming",
        "Bee Keeping",
        "Organic Farming",
        "Viticulture",
        "Sericulture",
        "Apiculture",
        "Vermiculture"
      ],
      required: true
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    size: { type: Number, required: true },

    sizeUnit: {
      type: String,
      enum: ["acres", "hectares", "square meters"],
      required: true
    },

    location: { type: String, required: true },

    soilType: {
      type: String,
      enum: [
        "Volcanic Loam",
        "Clay Loam",
        "Sandy Loam",
        "Clay",
        "Sandy",
        "Loamy Sand",
        "Peat",
        "Silt",
        "Chalky"
      ],
      required: true
    },

    established: { type: String, required: true },

    description: { type: String },

    irrigation: {
      type: String,
      enum: [
        "Rain-fed",
        "Drip Irrigation",
        "Sprinkler",
        "Flood Irrigation",
        "Center Pivot",
        "Sub-surface",
        "Manual"
      ]
    },

    ownership: {
      type: String,
      enum: [
        "Family Owned",
        "Private Limited",
        "Cooperative",
        "Partnership",
        "Corporate",
        "Community Owned"
      ],
      required: true
    },

    employees: { type: Number }
  },
  { timestamps: true }
);

const Farm = mongoose.model("Farm", farmSchema);
export default Farm;