import Crop from "../models/Crop.js";

export const CreateCrop = async (req, res) => {
  try {
    const { name, plantingDate, status, variety } = req.body;
    const { farmId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate required fields
    const requiredFields = { name, plantingDate, status, variety, farmId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    const crop = new Crop({
      name,
      farmerId: userId,
      farmId,
      variety,
      plantingDate,
      status,
    });

    await crop.save();

    res.status(201).json({
      message: "Crop created successfully",
      crop,
    });
  } catch (error) {
    console.error("CreateCrop Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCropsByFarmer = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const crops = await Crop.find({ farmerId: userId }).populate("farmId");

    // Return empty array instead of 404
    return res.status(200).json(crops);
  } catch (error) {
    console.error("getAllCropsByFarmer Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const role = req.user?.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const crops = await Crop.find().populate(
      "farmerId",
      "name email phone profile_pictures"
    ).populate("farmId");

    res.status(200).json(crops);
  } catch (error) {
    console.error("getAllCrops Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, plantingDate, status, variety } = req.body;

    const crop = await Crop.findById(id);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const userId = req.user?._id;
    const role = req.user?.role;

    // Permission check
    if (crop.farmerId.toString() !== userId.toString() && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build update object only for fields sent
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (plantingDate !== undefined) updates.plantingDate = plantingDate;
    if (status !== undefined) updates.status = status;
    if (variety !== undefined) updates.variety = variety;

    const updatedCrop = await Crop.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      message: "Crop updated successfully",
      updatedCrop,
    });
  } catch (error) {
    console.error("updateCrop Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findById(id);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const userId = req.user?._id;
    const role = req.user?.role;

    if (crop.farmerId.toString() !== userId.toString() && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Crop.findByIdAndDelete(id);

    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    console.error("deleteCrop Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
