import Livestock from "../models/Livestock.js";

export const createLivestock = async (req, res) => {
  try {
    const { type, breed, quantity, healthStatus } = req.body;
    const { farmId } = req.params;
    const farmerId = req.user._id;

    if (!farmId) {
      return res.status(400).json({ message: "Farm ID is required" });
    }

    if (!type || !healthStatus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const livestock = await Livestock.create({
      type,
      breed,
      quantity,
      healthStatus,
     farmId,
      farmerId
    });

    res.status(201).json(livestock);
  } catch (error) {
    console.log("Error creating livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllLivestock = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const livestock = await Livestock.find();
    res.status(200).json(livestock);
  } catch (error) {
    console.log("Error retrieving livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLivestockByFarmId = async (req, res) => {
  try {
    const { farmId } = req.params;
    const user = req.user;

    if (user.role !== "admin" && user.farmId?.toString() !== farmId.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const livestock = await Livestock.find({ farmId });
    if (!livestock) {
      return res.status(404).json({ message: "Livestock not found" });
    }
    res.status(200).json(livestock);
  } catch (error) {
    console.log("Error retrieving livestock by farm:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLivestockByFarmerId = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const livestock = await Livestock.find({ farmerId });
    res.status(200).json(livestock);
  } catch (error) {
    console.log("Error retrieving farmer livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateLivestock = async (req, res) => {
  try {
    const { livestockId } = req.params;
    const { type, breed, quantity, healthStatus} = req.body;

    const user = req.user;
    const livestock = await Livestock.findById(livestockId);

    if (!livestock) {
      return res.status(404).json({ message: "Livestock not found" });
    }

    if (user.role !== "admin" && livestock.farmerId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedLivestock = await Livestock.findByIdAndUpdate(
      livestockId,
      { type, breed, quantity, healthStatus },
      { new: true }
    );

    res.status(200).json(updatedLivestock);
  } catch (error) {
    console.log("Error updating livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const healthyanimalsforfarmer=async(req,res)=>{
  try {
    const farmerId = req.user._id;
    const livestock = await Livestock.find({ farmerId, healthStatus: "Healthy" });
    res.status(200).json(livestock);
  } catch (error) {
    console.log("Error retrieving farmer livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const deleteLivestock = async (req, res) => {
  try {
    const { livestockId } = req.params;
    const user = req.user;

    const livestock = await Livestock.findById(livestockId);
    if (!livestock) {
      return res.status(404).json({ message: "Livestock not found" });
    }

    if (user.role !== "admin" && livestock.farmerId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await livestock.deleteOne();

    res.status(200).json({ message: "Livestock deleted successfully" });
  } catch (error) {
    console.log("Error deleting livestock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
