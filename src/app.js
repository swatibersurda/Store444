import { userRouter } from "./Routes/userRouter.js";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./Middleware/ErrorMiddleware.js";
export const app=express();
app.use(express.json());
app.use(morgan("dev"))
app.use("/api/v1/user",userRouter)
app.use(cookieParser())
app.use(errorMiddleware)