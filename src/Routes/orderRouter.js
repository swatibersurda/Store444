import express from "express"
import { placeOrder } from "../Controller/OrderController.js";
export const orderRouter=express.Router();

orderRouter.route("/placeOrder").post(placeOrder)