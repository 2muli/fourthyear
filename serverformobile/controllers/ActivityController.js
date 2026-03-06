import Activity from "../models/Activity.js";

export const createActivity = async (req, res) => {
  try {
    const { type, activityDate, description } = req.body;
    const farmerId = req.user?._id;

    if (!farmerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!type || !activityDate || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const activity = new Activity({
      farmerId,
      type,
      activityDate,
      description,
    });
    await activity.save();
    res.status(201).json({ message: "Activity created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAllActivitiesByFarmer = async (req, res) => {
  try {
    const userId=req.user?._id
    if(!userId){
        return res.status(403).json({message:"Access denied"})
    }
    const activities = await Activity.find({farmerId:userId}).populate(
      "farmerId",
      "name email phone profile_pictures",
    );
    //return empty array instead of 404
    if(!activities){
        return res.status(200).json({message:"No activities found"})
    }
    res.status(200).json(activities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const fetchAllActivities =async (req,res) => {
    try {
        const role =req.user?.role
        if(role != "admin"){
            res.status(403).json({message:"Access denied. Only admin can access this route"})
        }
        const activities = await Activity.find().populate(
            "farmerId",
            "name email phone profile_pictures",
          );
          if(!activities){
            return res.status(200).json({message:"No activities found"})
          }
          res.status(200).json(activities);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
export const updateActivity = async(req,res) =>{
     try {
    const { id } = req.params;
    const { type, activityDate, description } = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const userId = req.user?._id;
    const role = req.user?.role;

    // Permission check
    if (activity.farmerId.toString() !== userId.toString() && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build update object only for fields sent
    const updates = {};
    if (type !== undefined) updates.type = type;
    if (activityDate !== undefined) updates.activityDate = activityDate;
    if (description !== undefined) updates.description = description;

    const updatedActivity = await Activity.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      message: "Activity updated successfully",
      updatedActivity,
    });
  } catch (error) {
    console.error("updateActivity Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}
export const deleteActivity=async(req,res)=>{
    try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const userId = req.user?._id;
    const role = req.user?.role;

    if (activity.farmerId.toString() !== userId.toString() && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Activity.findByIdAndDelete(id);
    console.log("Activity deleted successfully");
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("deleteActivity Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}