import mongoose from "mongoose";

const userSchema=new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:"https://www.istockphoto.com/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-gm1495088043-518213332"
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    resettoken:{
        type:String,
        default:null
    },
    resetexpires:{
        type:Date,
        default:null
    }
},{
    timestamps:true
})
const User=mongoose.model("User",userSchema);
export default User;
