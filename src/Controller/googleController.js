import passport from "passport";
import { User } from "../Model/userModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userInfo } from "os";
dotenv.config({ path: "./.env" });
// Redirect to Google for authentication....

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

//Handle Google OAuth callback.....
export const googleCallback = passport.authenticate("google", {
  // successRedirect:"http://localhost:5173/",
  // failureRedirect: "/",
  // failure redirect
failureRedirect: "http://localhost:5173/login",
});

//
export const postAuthMiddleware = async (req, res, next) => {
  let user;
  user = await User.findById(req.user?._id);

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  //   const token = await user.genrateToken();
  const token = jwt.sign(
    {
      _id: req.user._id,
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.EXPIRES_DAY }
  );
  // it will basically create a entire fresh token whether the user is in db or not as
  user.acessToken = token;
  await user.save({ validateBeforeSave: true });
  req.user.acessToken=token
  next();
};

export const redirecting = async (req, res, next) => {
  const {acessToken}=req.user
  // from this acess token we will find the user and save of redux 
  res.redirect(`${process.env.RESET_PASSWORD_LINK_WEBSITE}?token=${acessToken}`);
};

