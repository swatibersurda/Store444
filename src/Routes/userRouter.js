import  { Router } from "express";
import { Login, Register,RestPassword,Logout } from "../Controller/userController.js";
import { verifyJWT } from "../Middleware/authMiddleware.js";
export const userRouter=Router();
userRouter.route("/register").post(Register)
userRouter.route("/login").post(Login)
userRouter.route("/resetPassword").post(RestPassword)
userRouter.route("/logout").post(verifyJWT,Logout)