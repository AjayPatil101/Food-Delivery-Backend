import express from "express";
import { addToCart, fetchToCart, removeToCart } from "../Controllers/cartController.js";
import authMiddleware from '../Middleware/auth.js'
const cartRouter = express.Router();

cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeToCart);
cartRouter.post("/fetch",authMiddleware,fetchToCart);

export default cartRouter;