import express from "express";
import { couponList, addCoupon } from "../Controllers/couponController.js";
const couponRouter = express.Router();

// Route to get the list of coupons
couponRouter.get("/list/:userId", couponList);

// Route to add a new coupon
couponRouter.post("/add", addCoupon);

export default couponRouter;
