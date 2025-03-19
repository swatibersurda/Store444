import express from "express";
import { addProduct, getAllProduct } from "../Controller/ProductController.js";
import { upload } from "../Middleware/multerMiddleware.js";
import { AdminOnly } from "../Middleware/adminMiddleware.js";
export const productRouter = express.Router();
productRouter.route("/addProduct").post(AdminOnly,upload.single("pic"), addProduct);
// THESE PRODUCT WILL BE VISIBLE TO EVERYONE..
productRouter.route("/getProduct").get(getAllProduct);
