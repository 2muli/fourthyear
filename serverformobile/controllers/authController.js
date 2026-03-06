import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cloudinary from "../cloudinary.js";

dotenv.config();

export const Register = async (req, res) => {
  try {
    let { firstName, lastName, email, phone, password, location } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !location) {
      return res.status(400).json({ message: "All fields including are required" });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    phone = "+254" + phone;

    const phoneExist = await User.findOne({ phone });
    if (phoneExist) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      location,
    });

    await user.save();

    res.status(201).json({ message: "User Registered Successfully" });

  } catch (error) {
    console.error("Error During Registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const Login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Find user by email or phone
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "User Logged In Successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error During Login", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const UpdateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, email, profilePicture, phone, location } = req.body;

    if (!firstName || !lastName || !email || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist && emailExist._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const phoneExist = await User.findOne({ phone });
    if (phoneExist && phoneExist._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    const userToUpdate = await User.findById(user._id);

    let updatedImageUrl = userToUpdate.profilePicture;

    if (profilePicture && profilePicture !== userToUpdate.profilePicture) {
      
      if (userToUpdate.profilePicture) {
        const oldPublicId = userToUpdate.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`profile_pictures/${oldPublicId}`);
      }

      const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
        folder: "profile_pictures",
        resource_type: "image",
      });

      updatedImageUrl = uploadResponse.secure_url;
    }

    userToUpdate.firstName = firstName;
    userToUpdate.lastName = lastName;
    userToUpdate.email = email;
    userToUpdate.phone = phone;
    userToUpdate.location = location;
    userToUpdate.profilePicture = updatedImageUrl;

    await userToUpdate.save();

    res.status(200).json({
      message: "User Updated Successfully",
      updatedUser: userToUpdate,
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (!user) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    // Find the user to ensure we have the latest data
    const userToUpdate = await User.findById(user._id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      userToUpdate.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    userToUpdate.password = bcrypt.hashSync(newPassword, 10);
    await userToUpdate.save();

    res.status(200).json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log("Error changing password", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//get All user
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log("Error getting all users", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If the email exists, an OTP has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Expiry: 10 minutes
    const expiry = Date.now() + 10 * 60 * 1000;

    user.resettoken = hashedOTP;
    user.resetexpires = expiry;
    await user.save();

    // Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send Email with OTP
    await transporter.sendMail({
      from: `"Smart Agriculture" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <p>Hello,</p>
        <p>Your OTP for resetting your password is:</p>
        <h2 style="letter-spacing: 4px; font-size: 32px;">${otp}</h2>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });

    return res.status(200).json({
      message: "If the email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("OTP email error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};
export const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }

    // Hash OTP for comparison
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Validate OTP + Expiry
    if (user.resettoken !== hashedOTP || user.resetexpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    //Hashing new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    // Change password
    user.password = hashedPassword;

    // Clear reset fields
    user.resettoken = null;
    user.resetexpires = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
