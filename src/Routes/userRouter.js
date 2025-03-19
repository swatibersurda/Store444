import  { Router } from "express";
import { Login, Register,ForgetPassword,Logout,ResetPassword, findUserByToken, addProfilePic} from "../Controller/userController.js";
import { verifyJWT } from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/multerMiddleware.js";
export const userRouter=Router();
userRouter.route("/register").post(Register)
userRouter.route("/addprofile").patch(upload.single("pic"),addProfilePic)
userRouter.route("/login").post(Login)
userRouter.route("/logout").post(verifyJWT,Logout)
// userRouter.route("/forget").post(verifyJWT,Logout)
userRouter.route("/forgetpassword").post(ForgetPassword)
userRouter.route("/resetPassword/:token").post(ResetPassword)
userRouter.route("/tokenBasedUser").post(findUserByToken)