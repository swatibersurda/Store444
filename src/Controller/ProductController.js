import { Product } from "../Model/productModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { uploadCloudinary } from "../Utils/Cloudinary.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

export const addProduct = async (req, res, next) => {
  //   console.log("reaching here..",req.body)
  try {
    const { name, stock, price } = req.body;
    const pic = req.file?.path;
    //   console.log(pic, "iam pic");
    if (!pic) {
      return next(ErrorHandler("Product Pic is Required to Upload."));
    }
    const picLink = await uploadCloudinary(pic);
    console.log(picLink, "i am pickii...");
    const product = await Product.create({
      name,
      stock,
      price,
      pic: picLink?.url,
    });
    await product.save();
    return res
      .status(201)
      .json(new ApiResponse("Product Added Sucessfully", product, 201));
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 505));
  }
};
export const getAllProduct = async (req, res, next) => {
  try {
    const allProducts = await Product.find().lean().exec();
    return res.status(200).json(new ApiResponse("Fecthed All Product",allProducts,200));
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 505));
  }
};
