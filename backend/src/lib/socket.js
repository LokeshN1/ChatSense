import {Server} from 'socket.io';
import http from 'http';
import express from 'express'
import { config } from 'dotenv';

config();

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin :  [process.env.FRONTEND_URL],
    },
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}
// used to store online users -> when a socket connected means that user is online and when socket disconnects it means user gets offline
const userSocketMap = {};   // {userId = socketId}

io.on("connection", (socket) =>{
    console.log("A user connected "+socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients means online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // fetchout all online user from object userSocketMap

    socket.on("disconnect", () =>{
        console.log("A user disconnected "+socket.id);
        delete userSocketMap[userId];   // delete the user from list who gets disconnected means offline

        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // fetchout all online user from object userSocketMap

    })
    
})

export {io, app, server};