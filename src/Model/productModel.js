import mongoose, { Schema } from "mongoose";
export const productSchema=new Schema({
    name:{type:String,required:true},
    stock:{type:Number,required:true},
    price:{type:Number,required:true},
    pic:{type:String,required:true}
},{
    timestamps:true
})

export const Product=mongoose.model("Product",productSchema)