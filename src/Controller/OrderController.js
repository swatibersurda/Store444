import { Cart } from "../Model/cartModel.js";
import { Order } from "../Model/orderModel.js";
import { Product } from "../Model/productModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";

export const placeOrder = async (req, res, next) => {
  console.log(req.body);
  const { userId } = req.body;
  const { address, city, state, country, pinCode } = req.body.shippingInfo;

  try {
    const cart = await Cart.findOne({ userId });
    console.log(cart, "i am carttt...", cart.items.length);
    if (!cart || cart.items.length === 0) {
      // console.log("i am reaching here..");
      return next(new ErrorHandler("Cart is empty", 404));
    }

    // Create new order
    const newOrder = new Order({
      userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingInfo: {
        address: address,
        city: city,
        state: state,
        country: country,
        pinCode: pinCode,
      },
    });

    await newOrder.save();
    // sconsole.log(newOrder);
    const xy = cart.items.forEach((item) =>
      updateStock(item.productId._id, item.quantity)
    );
    // console.log(xy, "i am xy");
    // let sendUser=await Order.findOne({userId}).populate("items.productId").select("_id name price pic quantity");
    // let sendUser=await Order.findOne({userId}).populate("items.productId").select("_items.productId.stock")
    let sendUser = await Order.findOne({ userId }).populate({
      path: "items.productId",
      select: "-stock",
    });
    // console.log(sendUser,"i am sendUser")

    // upadte the stock in products

    //   cart.items = [];
    //   cart.totalAmount = 0;
    //   await cart.save();
    //

    res.send(sendUser);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const updateStock = async (productId, stockToUpdate) => {
  // first find the product
  // console.log(productId, stockToUpdate, "i am reaching here");
  const product = await Product.findById(productId);
  // console.log(product, "i am found productt..");
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  // this will update the stock...
  product.stock = product.stock - stockToUpdate;
  // console.log(product, "product After ");
  await product.save();
};

// this is admin only routes...
