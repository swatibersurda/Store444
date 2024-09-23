import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../Model/userModel.js";
dotenv.config({ path: "./.env" });

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return next(new ErrorHandler("Internal Server error..", 500));
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return next(new ErrorHandler("User Not Found to delete..", 500));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(
      new ErrorHandler(err.message || "Internal Server error..", 500)
    );
  }
};
