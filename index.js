import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from './config/db.js';
import foodRouter from './Routes/FoodRoute.js';
import bodyParser from  'body-parser';
import userRouter from './Routes/UserRoute.js';
import cartRouter from './Routes/CartRoute.js';
import orderRouter from './Routes/OrderRoute.js';
import couponRouter from './Routes/CouponRouter.js';

//app config
const app = express();
const port = process.env.PORT || 5000;



// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));
//app router
//middleware

app.use(express.json());
app.use(cors());
app.use("/api/food",foodRouter)
app.use("/image",express.static("Uploads"))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/coupon",couponRouter)

 
connectDB();


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
