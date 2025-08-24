import express from 'express';
import {analyzePersonChatWithThirdParty, queryPersonChatWithThirdParty, generateFollowUp, generateReply, refineMessage} from '../controllers/ai.controller.js';
const router = express.Router();

// POST /api/ai/analyze - Analyze conversation
router.post('/person-analyze', analyzePersonChatWithThirdParty);

// POST /api/ai/query - Ask a question about conversation
router.post('/person-query', queryPersonChatWithThirdParty);

// Route for Feature 1: Get follow-up suggestions
// Requires the IDs of the two users in the chat
router.post('/generate-follow-up', generateFollowUp);

// Route for Feature 2: Get reply suggestions for the last message
// Requires the IDs of the two users in the chat
router.post('/generate-reply', generateReply);

// Route for Feature 3: Refine a user's draft message
// Requires the user's text draft and an optional tone
router.post('/refine-message', refineMessage);


export default router;
