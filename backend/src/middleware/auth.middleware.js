import User from '../models/user.model.js'; // import user model
import jwt from 'jsonwebtoken'; // import jwt

export const protectRoute = async(req, res, next) => {
    const token = req.cookies.token;    // get token from cookie

    try {
        if (!token) {   // if token is not present
            return res.status(401).json({ message: "Unauthorized- No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // verify token
        if(!decoded){
            return res.status(401).json({message: "Unauthorized- Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password"); // get user data from token except password  
        
        if (!user) {    // if user is not found
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user; // set user data in request object     

        next(); // if token is verified, call next middleware
    }
    catch (error) {
        console.log("Error in protected route", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}