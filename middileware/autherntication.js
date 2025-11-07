// middleware/auth.js (Corrected)

const users = require('../models/users');
const redisClient = require('../utilss/redis');
const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {
    try {
        // 1. Extract the token (removing "Bearer " if present, but your current logic seems to assume it's the raw token)
        // If your frontend sends "Bearer <token>", you must remove "Bearer ". 
        // Based on your controller, let's assume you're passing the raw token here:
        let token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
        }
        
        // 2. CHECK THE BLOCK LIST FIRST using the modern 'await' syntax
   const reply = await redisClient.get(token); 
        
        if (reply === 'blocked') {
            return res.status(401).json({ success: false, message: 'Token has been revoked. Please log in again.' });
        }

        // 3. STANDARD JWT VERIFICATION (if not blocked)
        const decoded = jwt.verify(token, 'divyakavya'); // Use your secret key

        // The user ID is added to the request object for use in controllers
        req.user = decoded; 
        
        next(); // Proceed to the controller

    } catch (err) {
        console.error('Authentication Error:', err);
        // This catch block now handles JWT errors (expired, invalid) AND Redis errors
        
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
             return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }

        // For Redis connection errors or other server errors
        return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
}

module.exports = {
    authentication
};