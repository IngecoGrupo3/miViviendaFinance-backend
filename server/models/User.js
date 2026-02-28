import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    identityDocument: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    passwordHash: { type: String, required: true, select: false }
  },
  {
    timestamps: true,
    strict: "throw"
  }
);

const User = mongoose.model("User", userSchema);

export default User;