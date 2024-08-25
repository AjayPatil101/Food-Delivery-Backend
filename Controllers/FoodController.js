import foodModel from "../Models/FoodModel.js";
import fs from "fs";

// Add food
const addFood = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('Image upload failed');
        }
        // Get the filename of the uploaded image
        let image_filename = req.file.filename;

        // Create a new food item
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: image_filename,
            category: req.body.category
        });

        // Save the food item to the database
        const savedFood = await food.save();

        // Respond with the saved food item
        res.status(201).json({
            success:true,
            message: "Food item added successfully"
        });
    } catch (error) {
        console.error("Error adding food item:", error);

        // If the image was uploaded but the food item could not be saved,
        // remove the uploaded file to avoid orphaned files.
        if (req.file) {
            fs.unlink(`Uploads/${req.file.filename}`, (err) => {
                if (err) console.error("Error removing file:", err);
            });
        }

        res.json({
            success:false,
            message: "Error"
        });
    }
};

//All food list
const foodList = async (req, res) => {
    try {
        // Await the foodModel.find() to resolve before sending the response
        const food = await foodModel.find();

        // Send the response with the retrieved food items
        res.send({
            success: true,
            data: food
        });
    } catch (error) {
        console.error("Error retrieving food list:", error);
        res.json({
            success: false,
            message: "Error retrieving food list"
        });
    }
};

const removeList = async (req, res) => {
    try {
        // Find the food item by ID
        const food = await foodModel.findById(req.body.id);

        // Check if the food item exists
        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }

        // Delete the image file associated with the food item
        fs.unlink(`Uploads/${food.image}`, (err) => {
            if (err) {
                console.error("Error removing image file:", err);
            }
        });

        // Delete the food item from the database
        await foodModel.findByIdAndDelete(req.body.id);

        // Respond with success
        res.json({
            success: true,
            message: "Food item removed successfully"
        });
    } catch (error) {
        console.error("Error removing food item:", error.message);

        res.status(500).json({
            success: false,
            message: "Error removing food item"
        });
    }
};
export { addFood,foodList,removeList };
