import orderModel from "../Models/OrderModel.js";
import userModel from "../Models/UserModel.js";
import Stripe from "stripe"
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.stripe_Key)
const placeOrder = async (req, res) => {
    const frontend_url = process.env.frontend_url;
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {  // Corrected the typo here
                    name: item.name
                },
                unit_amount: item.price * 100 * 83
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {  // Corrected the typo here
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 83
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verifyTrue`,
            cancel_url: `${frontend_url}/verifyFalse`,
        });

        res.json({
            success: true,
            session_url: session.url,
            orderId:newOrder._id
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error"
        });
    }
}

const verifyOrder = async (req,res)=>{
    const {success,orderId}=req.body;
    try {
        
        if(success){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({
                success: true,
                 message: "Paid"
            });
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({
                success: false,
                 message: "Not Paid"
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error"
        });
    }
}

const userOrders = async(req,res)=>{
    try {
        const order = await orderModel.find({userId:req.body.userId});
        res.json({
            success: true,
            data:order
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error"
        });
    }
}

const listOrders = async(req,res)=>{
    try {
        const order = await orderModel.find({});
        res.json({
            success: true,
            data:order
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error"
        });
    }
}

const updateStatus= async(req,res)=>{
    try {
        const order = await orderModel.findByIdAndUpdate(req.body.orderId,{
            status:req.body.status
        });
        res.json({
            success: true,
            message: "Status Updated"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error"
        });
    }
}

export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}