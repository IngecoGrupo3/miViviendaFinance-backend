import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    timestamps: true,
    strict: "throw"
  }
);

const User = mongoose.model("User", userSchema);

export default User;