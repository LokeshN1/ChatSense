import jwt from 'jsonwebtoken';
export const generateToken = (userId, res) =>{
    
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {  // generate token
        expiresIn: "7d"
    }); 

    res.cookie("token", token, {    // send token in cookie
        expiresIn: "7d", // token will be removed after 7 days
        httpOnly: true, // so that token is not accessible by javascript (for prevent XSS attacks)
        sameSite : true, // to prevent CSRF attacks cross-site request forgery
        secure : process.env.NODE_ENV === "production" ? true : false // to make sure that cookie is only sent over https in production
        
    }); 
    return token;
}