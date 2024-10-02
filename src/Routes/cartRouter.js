import express from "express";
import { addToCart,getCartDataById } from "../Controller/cartController.js";
export const cartRouter=express.Router();
cartRouter.route("/addtocart").post(addToCart)
cartRouter.route("/:id").post(getCartDataById)


