import express from "express";
import { addProduct, getAllProduct } from "../Controller/ProductController.js";
import { upload } from "../Middleware/multerMiddleware.js";
import { AdminOnly } from "../Middleware/adminMiddleware.js";
// console.log(upload, "i am uploadd");
export const productRouter = express.Router();
productRouter.route("/addProduct").post(AdminOnly,upload.single("pic"), addProduct);
productRouter.route("/getProduct").get(AdminOnly,getAllProduct);
