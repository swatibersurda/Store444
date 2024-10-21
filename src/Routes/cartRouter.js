import express from "express";
import { addToCart,getCartDataById,removeFromCart } from "../Controller/cartController.js";
export const cartRouter=express.Router();
cartRouter.route("/addtocart").post(addToCart)
cartRouter.route("/removefromcart").post(removeFromCart)
cartRouter.route("/:id").get(getCartDataById)


