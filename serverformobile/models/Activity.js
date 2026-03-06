import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["Planting", "Harvesting", "Irrigation", 
            "Fertilizing", "Pruning", "Weeding", "Pest Control", 
            "Disease Management", "Other"],
        required: true
    },
    activityDate: { type: Date, required: true },
    description: { type: String, required: true },
},
{
    timestamps: true
})
const Activity = mongoose.model("Activity", ActivitySchema)
export default Activity