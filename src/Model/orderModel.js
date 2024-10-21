import express from "express";
import mongoose from "mongoose";
const orederSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: { type: Number, default: 1 },
    },
  ],

  totalAmount: { type: Number, default: 0 },

  shippingInfo: {
    address: {type: String,required: true},
    city: {type: String,required: true},
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
  },
});
export const Order = mongoose.model("Order", orederSchema);
