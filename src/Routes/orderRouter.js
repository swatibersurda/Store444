import express from "express"
import { getAllOrder,addOrder } from "../Controller/OrderController.js";
export const orderRouter=express.Router();
orderRouter.route("/addToCart").post(getAllOrder)
// this is for getting 
orderRouter.route("/getAllOrders").get(addOrder)