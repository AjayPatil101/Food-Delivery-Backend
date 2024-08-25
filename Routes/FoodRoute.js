import express from "express";
import { addFood, foodList, removeList } from "../Controllers/FoodController.js";
import multer from "multer";

const foodRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: "Uploads",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Initialize multer with storage configuration and file filter
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    }
});

// Define the route using the `upload` middleware
foodRouter.post('/add', upload.single("image"), addFood);
foodRouter.get('/list', foodList);
foodRouter.post('/remove', removeList);

export default foodRouter;
