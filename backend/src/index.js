import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";

import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config();        // so we can use env varibles from .env file

app.use(express.json()); // so we can parse json data from request body
app.use(cookieParser()); // so we can parse cookies from request headers
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    connectDB();
})