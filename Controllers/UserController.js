import userModel from "../Models/UserModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

//login user
const loginUser =async (req,res)=>{
    const {email,password}=req.body;
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message: "User doesn't exitsts"
            });
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({
                success:false,
                message: "Invalid Credentials"
            });
        }
        const token  = createToken(user._id);
        res.json({
            success:true,
            message: "User Longin successfully",
            token:token,
            userId:user._id
        })
    } catch (error) {
        res.json({
            success:false,
            message: "Error"
        });
    }
}

const createToken = (id)=>{
    return jwt.sign({id},process.env.secretKey)
}

//register user 
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please enter a strong password"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashPassword
        });
        const user = await newUser.save();

        // Coupon generation after user creation
        const coupons = [
            {
                userid: user._id,
                couponCode: "XRTY47ZL9P",
                couponAmount: 10,
                expiresAt: new Date('2024-12-31'),
                status: "active"
            },
            {
                userid: user._id,
                couponCode: "PWJQ89HAF6",
                couponAmount: 8,
                expiresAt: new Date('2024-11-30'),
                status: "active"
            },
            {
                userid: user._id,
                couponCode: "KLMU23BGZQ",
                couponAmount: 5,
                expiresAt: new Date('2024-10-15'),
                status: "active"
            },
            {
                userid: user._id,
                couponCode: "NYTV65EKJW",
                couponAmount: 3,
                expiresAt: new Date('2024-09-30'),
                status: "active"
            }
        ];

        // Save coupons to the database
        await couponModel.insertMany(coupons);

        // Create and return token
        const token = createToken(user._id);
        res.json({
            success: true,
            message: "User added successfully",
            token: token
        });

    } catch (error) {
        res.json({
            success: false,
            message: "Error"
        });
    }
};

export {
    registerUser,
    loginUser
}