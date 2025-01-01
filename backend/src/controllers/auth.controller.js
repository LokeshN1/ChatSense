import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res)=>{
    const {fullName, email, password} = req.body;
    console.log(fullName, email, password);
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }
        const user = await User.findOne({email});
        console.log(user);
        if(user){
            return res.status(400).json({message: "Email already exists"});
        }
        const salt = await bcrypt.genSalt(10); // generate salt for hashing
        const hashedPassword = await bcrypt.hash(password, salt); // hash the password
        const newUser = new User({          // create new user
            fullName, email, password: hashedPassword
        }); 

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save(); // save user in database

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
        else{
            return res.status(400).json({message: "Invalid user data"});
        }   

    }
    catch (error) {
        console.log("Error in signup", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
};


export const login = async (req, res)=>{
    const {email, password} = req.body;
    console.log(email, password);
    try {
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);  // compare password
        
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid email or password"});
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    }
    catch (error) {
        console.log("Error in login", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
    

};


export const logout = (req, res)=>{
    try {
        res.cookie("token", "", {expires: new Date(0)});    // remove token from cookie
        res.status(200).json({message: "Logged out successfully"});
    } 
    catch (error) {
        console.log("Error in logout", error.message);
        return res.status(500).json({message: "Internal server error"});   
    }
  
};


export const updateProfile = async (req, res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message: "Profile pic is required"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);   // upload image to cloudinary
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true}); // update user profile pic
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}


export const checkAuth = (req, res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}