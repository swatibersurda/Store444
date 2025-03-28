import { User } from "../Model/userModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { uploadCloudinary } from "../Utils/Cloudinary.js";
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
    return next(new ErrorHandler("User or email not Already Exist", 404));
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
      sameSite:"None"
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
  await User.findByIdAndUpdate(existingUser?._id, {
    $set: {
      acessToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
    sameSite:"None"
  };
  return res
    .status(200)
    .clearCookie("acessToken", options)
    .json(new ApiResponse("LogedOut Successfully...", {}, 200));
};

export const ForgetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return next(new ErrorHandler("Please Fill the Email", 402));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User Not found", 404));
    }
    const tokenToSentLink = jwt.sign(
      { _id: user?._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
      logger: true,
      debug: true,
    });
    const reciver = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `click on the link ${process.env.RESET_PASSWORD_LINK_WEBSITE}changepass/${tokenToSentLink}`,
    };
    transporter.sendMail(reciver);
    return res
      .status(200)
      .json(new ApiResponse("Link sent successfully...", {}, 200));
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const ResetPassword = async (req, res, next) => {
  const token = req.params.token;
  const passwordNew = req.body.password;
  try {
    if (!token) {
      return next(
        new ErrorHandler("Unauthorized Access to reset password", 404)
      );
    }
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(verifyToken?._id);
    if (req.body.email !== user.email) {
      return next(
        new ErrorHandler(
          "email associated the password is not same Please provide correct email"
        )
      );
    }
    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }
    // need to hash the password as well
    user.password = passwordNew;
    // here password should be encrypted because password is getting modifiedd...
    const df = await user.save({ validateBeforeSave: true });
    const xy = await User.findById(df?._id);
    return res
      .status(201)
      .json(new ApiResponse("Password Rested Successfully..", xy, 201));
  } catch (error) {
    return next(new ErrorHandler("Internal Error", 500));
  }
};
export const findUserByToken = async (req, res,next) => {
  const { token} = req.body;
  const user = await User.findOne({ acessToken: token });
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  return res.status(200).json(new ApiResponse("User Found", user, 200));
};



export const addProfilePic=async(req,res,next)=>{
  const {email,id,phone}=req.body
  console.log(email,id,phone)
  try {
    const pic=req.file?.path;
    console.log(pic,"i am pic")
    if(!pic){
      return next(ErrorHandler("profile pic required",400))
    }
    // making clou link..
    const picLink=await uploadCloudinary(pic)
    console.log(picLink?.url)
    if(!picLink){
      return next (new ErrorHandler("Failedd to upload img on cloudinary",500 ))
    }
    const user=await User.findByIdAndUpdate(id,{pic:picLink?.url,phone:phone},{new:true})
    console.log(user,"i am user after save")
    if(!user){
      return next(new ErrorHandler("User not found!!"))
    }
    return res.json(new ApiResponse("Profile pic added sucessfully",user,201))
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error",500))
  }
}
