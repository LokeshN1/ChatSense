import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except the logged-in one
    const allUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // For each user, find the last message exchanged with the logged-in user
    const usersWithLastMessage = await Promise.all(
      allUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessageTimestamp: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );

    // Sort users: those with recent messages first, then those without messages
    usersWithLastMessage.sort((a, b) => {
      if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
        return b.lastMessageTimestamp - a.lastMessageTimestamp;
      }
      if (a.lastMessageTimestamp) return -1;
      if (b.lastMessageTimestamp) return 1;
      return 0;
    });

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.log("Error in getUserForSidebar controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        let imageURL;
        if(image){
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url;
            console.log("checking"+imageURL)
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL
        });

        await newMessage.save();
        
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({message: 'Internal server error'});
        
    }
};