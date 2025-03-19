import { Cart } from "../Model/cartModel.js";
import { Product } from "../Model/productModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

export const addToCart = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }

    if (product?.stock <= 0) {
      return next(new ErrorHandler("Product is Out of stock", 404));
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.equals(productId));
    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity >= 2) {
        return next(new ErrorHandler("Only two Products can be added", 500));
      }
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    let updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    updatedCart.totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.price,
      0
    );

    await updatedCart.save();

    let userCart = await Cart.findOne({ userId }).populate("items.productId");
  

    return res.status(201).json(new ApiResponse( "Added To Cart Successfully", userCart, 201));
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// remove to cart..
export const removeFromCart = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(ErrorHandler("Cart Not Found", 404));
    }
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (itemIndex > -1 && quantity > 0) {
      cart.items[itemIndex].quantity =
        cart.items[itemIndex].quantity - quantity;
      // if after decreasing the quantity it is -neg or 0 then then need to remove the product from the cart
      if (cart.items[itemIndex].quantity <= 0) {
        // here will remove product
        let cartm = cart.items.filter((item, index) => index !== itemIndex);
        cart.items = cartm;
        await cart.save();
      } else if (cart.items[itemIndex].quantity >= 1) {
        await cart.save();
      }
      // item preent but the quantity not iven from fronten then remove it
    } 
    // can not add more then 2 product
    
    else if (itemIndex > -1 && !quantity) {
      // will run in case when want to remove the product or whole product when quantity to remove is -1
      let cartm = cart.items.filter((item, index) => index !== itemIndex);
      cart.items = cartm;
      await cart.save();
    }
    let updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );
    updatedCart.totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.price,
      0
    );
    await updatedCart.save();
    let xy = await Cart.findOne({ userId }).populate("items.productId");
    return res
      .status(201)
      .json(
        new ApiResponse(
          !quantity ? "Product Removed Sucessfully" : "Reduced quantity",
          xy,
          201
        )
      );
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getCartDataById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Cart.findOne({ userId: id }).populate("items.productId");
    if (!user) {
      return next(new ErrorHandler("User not found to show the cart", 404));
    }
    return res
      .status(200)
      .json(new ApiResponse("Cart Fetched Successfully...", user, 200));
  } catch (error) {
    return next(new ErrorHandler("Internal Error", 500));
  }
};
