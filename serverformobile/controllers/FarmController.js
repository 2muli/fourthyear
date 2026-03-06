import Farm from "../models/Farm.js";
import User from "../models/User.js";

export const createFarm = async (req, res) => {
  try {
    const {
      name,
      type,
      size,
      sizeUnit,
      location,
      soilType,
      established,
      description,
      irrigation,
      ownership,
      annualRevenue,
      employees,
      certifications
    } = req.body;

    const farmerId = req.user._id;

    const user = await User.findById(farmerId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const farmExists = await Farm.findOne({
      farmerId,
      name,
      location
    });

    if (farmExists) {
      return res
        .status(400)
        .json({ error: "A farm with this name and location already exists" });
    }

    if (
      !name ||
      !type ||
      !size ||
      !sizeUnit ||
      !location ||
      !soilType ||
      !established ||
      !ownership
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const farm = await Farm.create({
      name,
      type,
      farmerId,
      size,
      sizeUnit,
      location,
      soilType,
      established,
      description,
      irrigation,
      ownership,
      annualRevenue,
      employees,
      certifications
    });

    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllFarms = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const farms = await Farm.find();
    if (!farms) {
      return res.status(404).json({ error: "Farms not found" });
    }
    res.status(200).json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFarmsByFarmerId = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const farms = await Farm.find({ farmerId });
    if (!farms) {
      return res.status(404).json({ error: "Farms not found" });
    }
    res.status(200).json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const farmId = req.params.id;
    const user = req.user;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    if (user.role !== "admin" && farm.farmerId.toString() !== user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedFarm = await Farm.findByIdAndUpdate(farmId, req.body, {
      new: true
    });

    res.status(200).json(updatedFarm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const farmId = req.params.id;
    const user = req.user;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    if (user.role !== "admin" && farm.farmerId.toString() !== user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await farm.deleteOne();

    res.status(200).json({ message: "Farm deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
