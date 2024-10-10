import express from "express";
import { registerUser,loginUser, getUser, changeRole, getRole } from "../Controllers/UserController.js";

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/getUser",getUser);
userRouter.post("/role",changeRole);
userRouter.get("/role/:userId",getRole);

export default userRouter;