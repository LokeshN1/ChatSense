import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();        // so we can use env varibles from .env file
const app = express();
app.use(express.json()); // so we can parse json data from request body
app.use(cookieParser()); // so we can parse cookies from request headers
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    connectDB();
})