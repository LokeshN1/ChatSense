import express from 'express';
import {analyzePersonChatWithThirdParty, queryPersonChatWithThirdParty} from '../controllers/ai.controller.js';
const router = express.Router();

// POST /api/ai/analyze - Analyze conversation
router.post('/person-analyze', analyzePersonChatWithThirdParty);

// POST /api/ai/query - Ask a question about conversation
router.post('/person-query', queryPersonChatWithThirdParty);


export default router;
