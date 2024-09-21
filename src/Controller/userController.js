import { User } from "../Model/userModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const genrateTokenMethod = async (userId) => {
  const user = await User.findById(userId);
  const token = await user.genrateToken();
  user.acessToken = token;
  await user.save({ validateBeforeSave: false });
  return { token };
};

export const Register = async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  let existingUser;
  if (!name || !email || !phone || !password) {
    return next(new ErrorHandler("Please Fill all Details", 400));
  }

  existingUser = await User.findOne({ email }).lean().exec();
  if (existingUser) {
    return next(new ErrorHandler("User Already exist", 400));
  } else {
    try {
      console.log("at tryyy");
      const user = await User.create({ name, email, phone, password });
      return res.status(201).json(new ApiResponse("User Created", user, 201));
    } catch (error) {
      return next(new ErrorHandler("InternalServer Error", 500));
    }
  }
};
export const Login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  existingUser = await User.findOne({ email });
  if (!existingUser) {
    return next(new ErrorHandler("User or email Already Exist", 404));
  }
  try {
    const passWordCheck = await existingUser.isPasswordCorrect(password);
    if (!passWordCheck) {
      return next(ErrorHandler("UserName and Password is Incorrect", 400));
    }

    const { token } = await genrateTokenMethod(existingUser?._id);

    existingUser.acessToken = token;
    await existingUser.save({ validateBeforeSave: false });
    const options = {
      httpOnly: true,
      secure: true,
    };
    const data = await User.findById(existingUser?._id);
    return res
      .status(200)
      .cookie("acessToken", token, options)
      .json(new ApiResponse("LogedIn", data, 200));
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const Logout = async (req, res, next) => {
  const { user } = req;
  const existingUser = await User.findById(user?._id);
  if (!existingUser) {
    return next(ErrorHandler("User is unauthorised", 401));
  }
  const DataTo = await User.findByIdAndUpdate(existingUser?._id, {
    $set: {
      acessToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("acessToken", options)
    .json(new ApiResponse("LogedOut Successfully...", {}, 200));
};

export const RestPassword = async (req, res) => {};
