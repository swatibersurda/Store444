import { Cart } from "../Model/cartModel.js";
import { Product } from "../Model/productModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

export const addToCart = async (req, res, next) => {
    console.log("reaching herer","i am reaching here..",req.body)
  const { userId, productId, quantity } = req.body;
  try {
    const product=await Product.findById(productId);
    console.log(product,"i am pro found")
    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }
    // find the users cart on cart array
    //  as we will have many users cart there.. means 
    // first find user has a cart
    let cart=await Cart.findOne({userId});
    // no cart means adding first timeon cart.
    if(!cart){
        cart=new Cart({ userId, items: [] });

    }
    const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity; // Update quantity if item already in cart
    } else {
      cart.items.push({ productId, quantity }); // Add new item to cart
    }

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * product.price, 0);
    await cart.save();
    return res.status(201).json(new ApiResponse("User Added Sucessfully",cart,201))

  } catch (error) {
   return next(new ErrorHandler("Internal Server Error",500)) 
  }
};

export const getCartDataById = async (req, res, next) => {

};
