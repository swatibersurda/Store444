import  { Router } from "express";
import { Login, Register,ForgetPassword,Logout,ResetPassword} from "../Controller/userController.js";
import { verifyJWT } from "../Middleware/authMiddleware.js";
export const userRouter=Router();
userRouter.route("/register").post(Register)
userRouter.route("/login").post(Login)
userRouter.route("/logout").post(verifyJWT,Logout)
userRouter.route("/forget").post(verifyJWT,Logout)
userRouter.route("/forgetpassword").post(ForgetPassword)
userRouter.route("/resetPassword/:token").post(ResetPassword)