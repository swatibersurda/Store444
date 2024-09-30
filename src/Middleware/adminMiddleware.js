import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../Model/userModel.js";
dotenv.config({ path: "./.env" });

console.log(process.env.SECRET_KEY, "sec at adminnn");
export const AdminOnly = async (req, res, next) => {
  //   token based and and role based auth
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
    console.log(token, "i am tokenn..");
    if (!token) {
      return next(new ErrorHandler("Login First..", 404));
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedToken, "i am");
    const user = await User.findById(decodedToken?._id);
    console.log(user, "i am founduser");
    if (!user) {
      return next(new ErrorHandler("Unauthorized Acess"));
    }
    if (user.role !== "Admin") {
      return next(new ErrorHandler("Only allowed for admin", 404));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler("Internal server Error...", 500));
  }
};
