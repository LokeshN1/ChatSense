import express from 'express';
import { getUserForSidebar, getMessages, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/users', protectRoute, getUserForSidebar);   // get user for sidebar means get all users except the logged in user(current user) you can take example of whatsapp sidebar how it shows all users except the current user when we open it
router.get('/:id', protectRoute, getMessages); // get messages between logged in user and user with id=:id
router.post('/send/:id', protectRoute, sendMessage); // send message to user with id=:id

export default router;