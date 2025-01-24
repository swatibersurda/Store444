import { Cart } from "../Model/cartModel.js";
import { Product } from "../Model/productModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

// work on cart total...
export const addToCart = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    // console.log(product, "i am found productt..");
    // means user can not add this product on cart
    if (product?.stock <= 0) {
      return next(new ErrorHandler("Product is Out of stock", 404));
    }

    // find the users cart on cart array
    //  as we will have many users cart there.. means
    // first find user has a cart
    let cart = await Cart.findOne({ userId });
    // no cart means adding first timeon cart.
    console.log(cart, "i am cart..inhh");
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    // need to check if the quantity is not grater then product stock
    // console.log(cart, "i am cartt..");
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    // console.log(cart, "i am items before save...");
    await cart.save();
    // console.log(cart, "i am cart sfeter save in databasee...");
    // let updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    // console.log(updatedCart,"i am cartttjhjds");

    // updatedCart.totalAmount = updatedCart.items.reduce(
    //   (sum, item) => sum+item.quantity * product.price,0
    // );
    // console.log(updatedCart.totalAmount,"i am totalAmount")
    let updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );
    console.log(updatedCart, "i am updatedCarttt..");
    updatedCart.totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.price,
      0
    );
    // console.log(updatedCart.totalAmount, "i am total");

    await updatedCart.save();
    let userCart = await Cart.findOne({ userId }).populate("items.productId");

    return res
      .status(201)
      .json(new ApiResponse("User Added Sucessfully", userCart, 201));
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
// remove to cart..
export const removeFromCart = async (req, res, next) => {
  // console.log("reaching herer", "i am reaching here..", req.body);
  const { userId, productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    let cart = await Cart.findOne({ userId });
    // console.log(cart, "i am carttt...");
    if (!cart) {
      return next(ErrorHandler("Cart Not Found", 404));
    }
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    // console.log(itemIndex, "i am indexx");
    // removing the product incase when found the product to delete when quantity reduce
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
        console.log("reaching here at else i amm.78..");
        await cart.save();
      }
    } else if (itemIndex > -1 && !quantity) {
      // will run in case when want to remove the product or whole product when quantity to remove is -1
      let cartm = cart.items.filter((item, index) => index !== itemIndex);
      cart.items = cartm;
      await cart.save();
    }
    console.log("i am cart befre save.,cmd,");
    let updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );
    // console.log(updatedCart, "i am updatedCarttt..");
    updatedCart.totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.price,
      0
    );
    // console.log(updatedCart.totalAmount, "i am total");
    await updatedCart.save();
    return res
      .status(201)
      .json(
        new ApiResponse(
          !quantity ? "Product Removed Sucessfully" : "Reduced quantity",
          updatedCart,
          201
        )
      );
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getCartDataById = async (req, res, next) => {
  const { id } = req.params;
  console.log(id,"i am id")
  try {
    const user = await Cart.findOne({ userId: id }).populate('items.productId');
    console.log(user, "i am userr...");
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
