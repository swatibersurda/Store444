import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log(process.env.SECRET_KEY, "ubnvabs");
console.log(process.env.EXPIRES_DAY, "ubnvabs");
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    acessToken: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  console.log("i am invoking herer...", this.password);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
  return next();
});
userSchema.methods.validatePassword = async function (password) {
  console.log("i am isma");
  // Compare the hashed password stored in DB with the provided password
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      phone: this.phone,
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.EXPIRES_DAY }
  );
};

export const User = mongoose.model("User", userSchema);
