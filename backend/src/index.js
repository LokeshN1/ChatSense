import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config();        // so we can use env varibles from .env file

app.use(express.json()); // so we can parse json data from request body
app.use(cookieParser()); // so we can parse cookies from request headers
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const PORT = process.env.PORT;
const _dirname = path.resolve();
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    connectDB();
})