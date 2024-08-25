import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];

    // Check if the header is provided and if it contains a token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized. Login Again"
        });
    }

    // Extract the token part from the header
    const token = authHeader.split(' ')[1];
    

    try {
        // Verify the token
        const tokenDecode = jwt.verify(token, process.env.secretKey);
        req.body.userId = tokenDecode.id;
        next();
    } catch (error) {
        
        // Determine the specific error type
        let errorMessage = "Error in authentication";
        if (error.name === 'JsonWebTokenError') {
            errorMessage = "Invalid Token";
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = "Token Expired";
        }

        return res.status(401).json({
            success: false,
            message: errorMessage
        });
    }
}

export default authMiddleware;
