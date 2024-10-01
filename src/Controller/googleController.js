import passport from "passport";
import { User } from "../Model/userModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// Redirect to Google for authentication....

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

//Handle Google OAuth callback.....
export const googleCallback = passport.authenticate("google", {
  //   successRedirect: '/',
  failureRedirect: "/",
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
  user.acessToken = token;
  await user.save({ validateBeforeSave: false });
  next();
};

export const redirecting = async (req, res, next) => {
res.redirect("/");
};