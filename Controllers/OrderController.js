import orderModel from "../Models/OrderModel.js";
import userModel from "../Models/UserModel.js";
import CouponModel from "../Models/CouponModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.stripe_Key);
const placeOrder = async (req, res) => {
  const frontend_url = process.env.frontend_url;
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      couponCode: req.body.couponCode,
      couponAmount: req.body.couponAmount,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100 * 83,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100 * 83,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

const verifyOrder = async (req, res) => {
  const { success, orderId, userId, couponCode } = req.body;

  try {
    if (success) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await CouponModel.findOneAndUpdate(
        { userid: userId, couponCode: couponCode },
        { status: "used" },
        { new: true }
      );
      res.json({
        success: true,
        message: "Paid",
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({
        success: false,
        message: "Not Paid",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

const userOrders = async (req, res) => {
  try {
    const order = await orderModel.find({ userId: req.body.userId });
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const order = await orderModel.find({});
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({
      success: true,
      message: "Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};
const getCategoryCount = async (req, res) => {
  try {
    // Define all possible categories
    const allCategories = [
      "Pure Veg",
      "Pasta",
      "Cake",
      "Rolls",
      "Sandwich",
      "Noodles",
      "Salad",
      "Deserts",
    ];

    // Get the total sales amount (quantity * price) for each category
    const categorySales = await orderModel.aggregate([
      { $unwind: "$items" }, // Unwind the items array
      {
        $group: {
          _id: "$items.category", // Group by category
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          }, // Calculate total sales (quantity * price)
          totalQuantity: { $sum: "$items.quantity" }, // Sum the quantities per category
        },
      },
    ]);

    // Create a map of existing category sales
    const categoryMap = categorySales.reduce((map, category) => {
      map[category._id] = {
        totalSales: category.totalSales,
        totalQuantity: category.totalQuantity,
      };
      return map;
    }, {});

    // Ensure all categories, even those with zero sales, are included
    const result = allCategories.map((category) => ({
      _id: category,
      totalSales: categoryMap[category]?.totalSales || 0, // If category doesn't exist, assign 0
      totalQuantity: categoryMap[category]?.totalQuantity || 0, // If category doesn't exist, assign 0
    }));

    // Sort result by totalSales to get top and bottom sales
    const sortedResult = result.sort((a, b) => b.totalSales - a.totalSales);

    // Find top and bottom sales
    const topSale = sortedResult[0]; // The first item in the sorted array has the highest sales
    const bottomSale = sortedResult[sortedResult.length - 1]; // The last item has the lowest sales

    // Send the response
    res.json({
      success: true,
      categorySales: result,
      topSale,
      bottomSale,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in fetching sales data",
    });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  getCategoryCount,
};
