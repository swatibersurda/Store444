import express from "express"
import { placeOrder,ejsFun} from "../Controller/OrderController.js";
export const orderRouter=express.Router();

orderRouter.route("/placeOrder").post(placeOrder)
orderRouter.route("/ex").get(ejsFun)