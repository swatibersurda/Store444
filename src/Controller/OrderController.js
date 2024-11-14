import { Cart } from "../Model/cartModel.js";
import { Order } from "../Model/orderModel.js";
import { Product } from "../Model/productModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import ejs from "ejs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import pdf from "html-pdf";
import path from "path";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
// import { header } from "express/lib/request.js";
import { User } from "../Model/userModel.js";
import ApiResponse from "../Utils/ApiResponse.js";
console.log(process.env.SENDER_EMAIL, "i am at line 10 ");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

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
    let sendUser = await Order.findOne({ userId }).populate({
      path: "items.productId",
      select: "-stock",
    });

    // cart.items = [];
    // cart.totalAmount = 0;
    // await cart.save();
    // here we will again do query and then after that will send it to create the pdf and from that ejs file.
    const userToEjs = await Order.findOne({ userId });
    console.log(userToEjs, "i am userToejss....");
    const userSentEmail = await User.findById({ _id: userId });
    console.log(userSentEmail, "user email address..");
    console.log(userToEjs, "i am order");
    const htmlContent = await ejs.renderFile(
      path.join("src/views", "index.ejs"),
      { data: sendUser }
    );
    console.log(htmlContent, "i am html contentt..");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content in the page
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({ format: "A4" });
    console.log(pdfBuffer, "i am pdfBuffer");

    // Close the browser
    await browser.close();

    // return pdfBuffer;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "swatibersurda@gmail.com",
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
    // });
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    // return res.json(new ApiResponse("sent sucesfully", sendUser, 200));
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const updateStock = async (productId, stockToUpdate) => {
  // first find the product
  // console.log(productId, stockToUpdate, "i am reaching here");
  const product = await Product.findById(productId);
  console.log(product, "i am found productt..");
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  // this will update the stock...
  product.stock = product.stock - stockToUpdate;
  console.log(product, "product After ");
  await product.save();
};

// this is admin only routes...

export const ejsFun = async (req, res, next) => {
  return res.render("index");
};
