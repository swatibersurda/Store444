import { userRouter } from "./Routes/userRouter.js";
import { googleRouter } from "./Routes/googleRouter.js";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./Middleware/ErrorMiddleware.js";
import passport from "passport";
import { productRouter } from "./Routes/productRouter.js";
// this is for starting google scope.
import "./Db/google-auth.js";
import { orderRouter } from "./Routes/orderRouter.js";
import { cartRouter } from "./Routes/cartRouter.js";
// import path from "path"
// import path, { dirname } from 'path';
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const app = express();
app.use(
  session({
    secret: "your-secret-key", // Replace this with a strong, random secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { secure: false }, // Use `true` if using HTTPS
  })
);
// app.set('views', path.join(__dirname, 'src', 'views'));
// app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
// app.use(passport.initialize())
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/google", googleRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);
app.use(errorMiddleware);
