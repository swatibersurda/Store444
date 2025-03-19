import { Cart } from "../Model/cartModel.js";
import { Order } from "../Model/orderModel.js";
import { Product } from "../Model/productModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import ejs from "ejs";
import dotenv from "dotenv";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

dotenv.config({ path: "./.env" });
import pdf from "html-pdf";
import path from "path";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import { User } from "../Model/userModel.js";
import ApiResponse from "../Utils/ApiResponse.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const placeOrder = async (req, res, next) => {
  const { userId } = req.body;
  const { address, city, state, country, pinCode } = req.body.shippingInfo;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler("Cart is empty", 404));
    }


    const lineItems = cart.items.map((item) => ({
      
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: [item.productId.pic], // Ensure your product model has an 'image' field
        },
        unit_amount: Math.round(item.productId.price * 100), // Convert price to cents
        // unit_amount: item.productId.price , // Convert price to cents
      },
      quantity: item.quantity,
    }));
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.RESET_PASSWORD_LINK_WEBSITE}success`,
      cancel_url:`${process.env.RESET_PASSWORD_LINK_WEBSITE}cart`,
      customer_email: (await User.findById(userId)).email,
      shipping_address_collection: {
        allowed_countries: ['IN'], 
      },
      metadata: {
        userId,
        shippingInfo: JSON.stringify(req.body.shippingInfo),
      },
    });
    // tripe payment ateway
    //   // Create new order
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
   
   let datam= await newOrder.save();
    // 1st step stripe payment
    // 2nd step create ejs file
    // 3rd step pdf create
    // 4th step node mailer sent mail.
    
    const xy = cart.items.forEach((item) =>
      updateStock(item.productId._id, item.quantity)
    );
    // we need to send that order which we saved then need to send it for pdf creation.
    let sendUser = await Order.findOne({ _id:datam?._id }).populate({
      path: "items.productId",
      select: "-stock",
    });
    
    const userSentEmail = await User.findById({ _id: userId });
    const htmlContent = await ejs.renderFile(
      path.join("src/views", "index.ejs"),
      { data: sendUser }
    );
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // // Set the HTML content in the page
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // // Generate PDF
    const pdfBuffer = await page.pdf({ format: "A4" });

    // // Close the browser
    await browser.close();

    // return pdfBuffer;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userSentEmail.email,
      subject: "Your PDF Document",
      text: "Please find the attached PDF.",
      attachments: [
        {
          filename: "document.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Step 5: Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return res.json(new ApiResponse("order placed succesfully.....", {id:session.id}, 200));
  } catch (error) {
    return next(new ErrorHandler("internal server error", 500));
  }
};

const updateStock = async (productId, stockToUpdate) => {
  // first find the product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  // this will update the stock...
  product.stock = product.stock - stockToUpdate;
  await product.save();
};

// this is admin only routes...

export const ejsFun = async (req, res, next) => {
  return res.render("index");
}
