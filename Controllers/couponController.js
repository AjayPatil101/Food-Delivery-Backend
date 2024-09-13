import CouponModel from "../Models/CouponModel.js";
import mongoose from "mongoose";

const couponList = async (req, res) => {
    try {
        const userId = req.params.userId;
        const coupons = await CouponModel.find({ userid: userId,status: "active", });
        res.send({
            success: true,
            data: coupons
        });
    } catch (error) {
        console.error("Error retrieving coupon list:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving coupon list"
        });
    }
};


const addCoupon = async (req, res) => {
    try {
        const { userid, couponCode, couponAmount, expiresAt } = req.body;
        const newCoupon = new CouponModel({
            userid,
            couponCode,
            couponAmount,
            expiresAt,
        });
        await newCoupon.save();
        res.send({
            success: true,
            message: "Coupon added successfully",
            data: newCoupon
        });
    } catch (error) {
        console.error("Error adding coupon:", error);
        res.json({
            success: false,
            message: "Error adding coupon"
        });
    }
};

export { couponList, addCoupon };
