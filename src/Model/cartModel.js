import express from "express";
import mongoose from "mongoose";
const cartSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId},
    items:[
        {
            productId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Product"},
            quantity:{type:Number,default:1}

        }
    ],
    totalAmount:{type:Number,default:0}
})
export const Cart=mongoose.model("Cart",cartSchema)