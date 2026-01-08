import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import {config} from 'dotenv';




const formatChatForAI = (messages, userIdToName) => {
  return messages.map(msg => {
    const senderName = userIdToName[msg.senderId.toString()] || 'Unknown User';
    return `[${msg.createdAt.toISOString()}] ${senderName}: ${msg.text}`;
  }).join('\n');
};

// function to analyze chat between two users
// This function will use the Google Gemini API to analyze the chat
export const analyzePersonChatWithThirdParty = async (req, res) => {
  try {

    const { currentUserId, otherPersonId } = req.body;
    console.log("---HELO---")
    if (!currentUserId || !otherPersonId) {
      return res.status(400).json({ error: 'currentUserId and otherPersonId are required' });
    }

    // --- Step 1: Fetch Conversation Data (same as original function) ---
    const mongoose = (await import('mongoose')).default;

    const [userA, userB] = await Promise.all([
      User.findById(currentUserId),
      User.findById(otherPersonId)
    ]);

    if (!userA || !userB) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const userIdToName = {
      [userA._id.toString()]: userA.fullName,
      [userB._id.toString()]: userB.fullName
    };

    const messages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(currentUserId), receiverId: new mongoose.Types.ObjectId(otherPersonId) },
        { senderId: new mongoose.Types.ObjectId(otherPersonId), receiverId: new mongoose.Types.ObjectId(currentUserId) }
      ],
    }).sort({ createdAt: 1 }).limit(100); // Increased limit for better context

    if (messages.length === 0) {
        return res.status(200).json({ message: "No messages to analyze.", analysis: {} });
    }

    // --- Step 2: Prepare and Call Third-Party AI (Gemini) ---
    try {
      config(); // so we can use env varibles from .env file
      const geminiApiKey = process.env.GEMINI_API_KEY;
      console.log(geminiApiKey);
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
      const chatHistoryForPrompt = formatChatForAI(messages, userIdToName);

      const prompt = `
        You are an expert conversation analyst.
        Analyze the following chat conversation between ${userA.fullName} and ${userB.fullName}.
        Based on the conversation, provide a detailed analysis.
        The current user is ${userA.fullName}.

        Here is the chat history:
        --- CHAT START ---
        ${chatHistoryForPrompt}
        --- CHAT END ---

        Please return your analysis as a single, valid JSON object with the following structure. Do not include any text or markdown formatting before or after the JSON object.
        {
          "summary": {
            "conversationHeader": "A brief, one-sentence title for the conversation.",
            "mainDiscussion": "A 2-3 sentence summary of the main points discussed.",
            "overallTone": "Describe the overall tone (e.g., 'Friendly and casual', 'Formal and professional', 'Tense and argumentative')."
          },
          "sentiment": "Overall sentiment of the conversation (Positive, Negative, Neutral).",
          "topics": ["List of the 3-5 most important topics discussed."],
          "decisions": [
            {
              "decision": "A concise description of a decision made.",
              "madeBy": "The name of the person who made the decision or 'Both'."
            }
          ],
          "entities": {
            "locations": ["List any mentioned locations."],
            "dates": ["List any mentioned dates or days."],
            "organizations": ["List any mentioned organizations."]
          }
        }
      `;

      const result = await generateWithFallback(genAI, geminiApiKey, "gemini-1.5-flash-001", prompt);
      const response = result.response;
      const aiResponseText = response.text();
      console.log('AI Response:', aiResponseText);
      let analysisResult;
      try {
        // The AI response might be enclosed in markdown, so we clean it.
        const cleanedJsonString = aiResponseText.replace(/```json\n|```/g, '').trim();
        analysisResult = JSON.parse(cleanedJsonString);
      } catch (parseError) {
         console.error("Failed to parse AI JSON response:", aiResponseText);
         throw new Error("AI returned a non-JSON or malformed response.");
      }
      
      // --- Step 3: Format and Send the Final Response ---
      const finalResponse = {
              analysis: {
              confidence: 0.95, // Static confidence as Gemini API doesn't provide this
              intent: "General Conversation", // Static intent
              sentiment: analysisResult.sentiment,
              message_count: messages.length, // Add the message count
              participants: [userA.fullName, userB.fullName],
              timestamp: new Date().toISOString(),
              topics: analysisResult.topics, // Use the new 'topics' key
              decision: analysisResult.decisions, // Use the new 'decisions' key
              entities: analysisResult.entities,
              summary: analysisResult.summary
          },
          conversation: {
              id: `${userA._id.toString()}_${userB._id.toString()}`,
              display_name: `${userA.fullName} & ${userB.fullName}`,
              participants: [
                  { id: userA._id.toString(), name: userA.fullName },
                  { id: userB._id.toString(), name: userB.fullName }
              ]
          },
          timestamp: new Date().toISOString()
      };
      
      console.log('Successfully received and parsed analysis from third-party AI.\n', finalResponse);
      res.json(finalResponse);

    } catch (aiError) {
      console.error('Error communicating with the third-party AI service:', aiError.message);
      res.status(502).json({
        error: 'Failed to communicate with the third-party AI service',
        details: aiError.message
      });
    }

  } catch (error) {
    console.error('analyzePersonChatWithThirdParty error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Function to query user regarding chat conversation

export const queryPersonChatWithThirdParty = async (req, res) => {
  try {
    const { currentUserId, otherPersonId, query } = req.body;

    if (!currentUserId || !otherPersonId || !query) {
      return res.status(400).json({ error: 'currentUserId, otherPersonId, and query are required' });
    }

    // --- Step 1: Fetch Conversation Data for Context ---
    const mongoose = (await import('mongoose')).default;

    const [userA, userB] = await Promise.all([
      User.findById(currentUserId),
      User.findById(otherPersonId)
    ]);

    if (!userA || !userB) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const userIdToName = {
      [userA._id.toString()]: userA.fullName,
      [userB._id.toString()]: userB.fullName
    };

    // Fetch a good amount of history for the AI to have context
    const messages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(currentUserId), receiverId: new mongoose.Types.ObjectId(otherPersonId) },
        { senderId: new mongoose.Types.ObjectId(otherPersonId), receiverId: new mongoose.Types.ObjectId(currentUserId) }
      ],
    }).sort({ createdAt: 1 }).limit(150);

    if (messages.length === 0) {
        return res.status(200).json({ answer: "There are no messages in this chat to search for an answer." });
    }

    // --- Step 2: Prepare and Call Third-Party AI (Gemini) ---
    try {
      config();
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);

      const chatHistoryForPrompt = formatChatForAI(messages, userIdToName);

      const prompt = `
        You are a helpful AI assistant. Your task is to answer a specific question based ONLY on the provided chat history between ${userA.fullName} and ${userB.fullName}.
        Do not use any external knowledge or make assumptions. If the answer is not in the chat, state that clearly.

        Here is the chat history:
        --- CHAT START ---
        ${chatHistoryForPrompt}
        --- CHAT END ---

        Now, please answer the following question: "${query}"

        Return your answer as a single, valid JSON object with the following structure. Do not include any text or markdown formatting before or after the JSON object.
        {
          "question": "Repeat the exact question that was asked: ${query}"
          "answer": "Your concise answer here. If the information is not in the chat, say 'The answer could not be found in this conversation.'"
        }
      `;

      const result = await generateWithFallback(genAI, geminiApiKey, "gemini-1.5-flash-001", prompt);
      const response = result.response;
      const aiResponseText = response.text();
      
      let queryResult;
      try {
        const cleanedJsonString = aiResponseText.replace(/```json\n|```/g, '').trim();
        queryResult = JSON.parse(cleanedJsonString);
      } catch (parseError) {
         console.error("Failed to parse AI JSON response for query:", aiResponseText);
         throw new Error("AI returned a non-JSON or malformed response.");
      }
      
      console.log(`Successfully answered query: "${query}"`);
      console.log(queryResult)
      res.json(queryResult);

    } catch (aiError) {
      console.error('Error communicating with the third-party AI service for query:', aiError.message);
      res.status(502).json({
        error: 'Failed to communicate with the third-party AI service',
        details: aiError.message
      });
    }

  } catch (error) {
    console.error('queryPersonChatWithThirdParty error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// --- Feature 1: Generate Follow-Up Suggestions ---
export const generateFollowUp = async (req, res) => {
    try {

        const { currentUserId, otherPersonId } = req.body;
        if (!currentUserId || !otherPersonId) {
            return res.status(400).json({ error: 'currentUserId and otherPersonId are required' });
        }

        // --- Fetch Data ---
        const [userA, userB] = await Promise.all([
            User.findById(currentUserId),
            User.findById(otherPersonId)
        ]);
        if (!userA || !userB) return res.status(404).json({ error: 'One or both users not found' });

        const userIdToName = {
            [userA._id.toString()]: userA.fullName,
            [userB._id.toString()]: userB.fullName
        };

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherPersonId },
                { senderId: otherPersonId, receiverId: currentUserId }
            ],
        }).sort({ createdAt: -1 }).limit(20); // Get recent messages for context

        const chatHistoryForPrompt = formatChatForAI(messages.reverse(), userIdToName);

        // --- AI Call ---
        config();
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) throw new Error('GEMINI_API_KEY environment variable not set.');
        const genAI = new GoogleGenerativeAI(geminiApiKey);

        const prompt = `
            You are a creative conversation assistant. Your goal is to help a user continue a conversation with someone else.
            The user, "${userA.fullName}", is talking to "${userB.fullName}".

            Based on their recent chat history, suggest three engaging and relevant follow-up messages or questions that "${userA.fullName}" can send to continue the conversation.
            If there is no chat history, suggest three interesting conversation starters.
            The tone should be casual and friendly.

            Chat History:
            ---
            ${chatHistoryForPrompt}
            ---

            Return your suggestions as a single, valid JSON object with a single key "suggestions" which is an array of three strings. Do not include any text or markdown formatting before or after the JSON object.
            Example format:
            {
              "suggestions": [
                "That sounds interesting! Tell me more about it.",
                "Speaking of that, have you ever tried...?",
                "What are you up to this weekend?"
              ]
            }
        `;

        const result = await generateWithFallback(genAI, geminiApiKey, "gemini-1.5-flash-001", prompt);
        const response = result.response;
        const cleanedJsonString = response.text().replace(/```json\n|```/g, '').trim();
        const suggestions = JSON.parse(cleanedJsonString);

        console.log(":--------Follow-Up Suggestions--------:\n", suggestions);
        // const suggestions = {
        //       "suggestions": [
        //         "That sounds interesting! Tell me more about it.",
        //         "Speaking of that, have you ever tried...?",
        //         "What are you up to this weekendHey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.?"
        //       ]
        //     };

        res.json(suggestions);

    } catch (error) {
        console.error('generateFollowUp error:', error);
        res.status(500).json({ error: 'Failed to generate follow-up suggestions', details: error.message });
    }
};


// --- Feature 2: Generate Reply Suggestions ---
export const generateReply = async (req, res) => {
    try {
        const { currentUserId, otherPersonId } = req.body;
        if (!currentUserId || !otherPersonId) {
            return res.status(400).json({ error: 'currentUserId and otherPersonId are required' });
        }


        // --- Fetch Data ---
        const [userA, userB] = await Promise.all([
            User.findById(currentUserId),
            User.findById(otherPersonId)
        ]);
        if (!userA || !userB) return res.status(404).json({ error: 'One or both users not found' });
        
        const userIdToName = {
            [userA._id.toString()]: userA.fullName,
            [userB._id.toString()]: userB.fullName
        };

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherPersonId },
                { senderId: otherPersonId, receiverId: currentUserId }
            ],
        }).sort({ createdAt: -1 }).limit(10); // Context is key, get recent messages

        if (messages.length === 0 || messages[0].senderId.toString() === currentUserId) {
            return res.status(400).json({ error: 'There is no message from the other person to reply to.' });
        }

        const lastMessage = messages[0].text;
        const chatHistoryForPrompt = formatChatForAI(messages.reverse(), userIdToName);

        // --- AI Call ---
        config();
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) throw new Error('GEMINI_API_KEY environment variable not set.');
        const genAI = new GoogleGenerativeAI(geminiApiKey);

        const prompt = `
            You are a helpful chat assistant. Your task is to help a user, "${userA.fullName}", reply to a message from "${userB.fullName}".
            The last message from "${userB.fullName}" was: "${lastMessage}"

            Considering the recent chat history, generate three different reply options for "${userA.fullName}". The replies should be natural, concise, and appropriate for the context.

            Recent Chat History:
            ---
            ${chatHistoryForPrompt}
            ---

            Return your suggestions as a single, valid JSON object with a single key "replies" which is an array of three strings. Do not include any text or markdown formatting before or after the JSON object.
            Example format:
            {
              "replies": [
                "I agree!",
                "That's a good point, I hadn't thought of that.",
                "Haha, that's hilarious!"
              ]
            }
        `;
        
        const result = await generateWithFallback(genAI, geminiApiKey, "gemini-1.5-flash-001", prompt);
        const response = result.response;
        const cleanedJsonString = response.text().replace(/```json\n|```/g, '').trim();
        const replies = JSON.parse(cleanedJsonString);

        console.log(":--------Replies Suggestions--------:\n", replies);
        // const replies = {
        //       "replies": [
        //         "I agree!Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.",
        //         "That's a good point, I hadn't thought of that.",
        //         "Haha, that's hilarious!"
        //       ]
        //     };
        res.json(replies);

    } catch (error) {
        console.error('generateReply error:', error);
        res.status(500).json({ error: 'Failed to generate reply suggestions', details: error.message });
    }
};


// --- Feature 3: Refine User's Message ---
export const refineMessage = async (req, res) => {
    try {
        const { userDraft, tone } = req.body; // tone can be 'casual', 'professional', 'friendly', 'humorous', etc.
        if (!userDraft) {
            return res.status(400).json({ error: 'userDraft is required' });
        }

        // --- AI Call ---
        config();
        const geminiApiKey2 = process.env.GEMINI_API_KEY;
        if (!geminiApiKey2) throw new Error('GEMINI_API_KEY environment variable not set.');
        const genAI2 = new GoogleGenerativeAI(geminiApiKey2);

        const prompt = `
            You are an expert writing assistant. A user wants to send a message but needs help phrasing it.
            Their rough draft is: "${userDraft}"

            Your task is to refine this draft and provide three alternative versions.
            The tone should be ${tone || 'clear and friendly'}. The message should be well-written, natural, and achieve the user's likely goal.

            Return your suggestions as a single, valid JSON object with a single key "refined_messages" which is an array of three strings. Do not include any text or markdown formatting before or after the JSON object.
        `;

        const result = await generateWithFallback(genAI2, geminiApiKey2, "gemini-1.5-flash-001", prompt);
        const response = result.response;
        const cleanedJsonString = response.text().replace(/```json\n|```/g, '').trim();
        const refinedMessages = JSON.parse(cleanedJsonString);
        console.log(":--------Refined Messages--------:\n", refinedMessages);
        // const refinedMessages = {
        //       "refined_messages": [
        //         "Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.Hey! Just wanted to check in and see how you're doing.",
        //         "Hi there! Hope everything's going well with you.",
        //         "Hello! It's been a while, how have you been?"
        //       ]
        //     };
            
        res.json(refinedMessages);

    } catch (error) {
        console.error('refineMessage error:', error);
        res.status(500).json({ error: 'Failed to refine the message', details: error.message });
    }
};

// Helper: try to generate using preferred model; on 404, list models and retry with a fallback
const generateWithFallback = async (genAI, apiKey, preferredModel, prompt) => {
  const tryGenerate = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    return await model.generateContent(prompt);
  };

  try {
    return await tryGenerate(preferredModel);
  } catch (err) {
    // If model not found for this API version, attempt to list available models and retry once
    if (err && err.status === 404) {
      try {
        const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        const resp = await axios.get(listUrl, { params: { key: apiKey } });
        const models = resp.data && resp.data.models ? resp.data.models : resp.data;

        // Pick a fallback model. Prefer models with 'gemini' in the name and that include any "generate" text in their metadata
        let fallback;
        if (Array.isArray(models)) {
          fallback = models.find(m => (m.name || m.model || '').toLowerCase().includes('gemini')) || models[0];
        } else if (models && typeof models === 'object') {
          // sometimes the response shape differs
          const arr = Object.values(models).flat();
          fallback = arr.find(m => (m.name || m.model || '').toLowerCase().includes('gemini')) || arr[0];
        }

        const fallbackModelName = (fallback && (fallback.name || fallback.model)) || null;
        if (!fallbackModelName) throw err; // nothing sensible to try

        console.warn(`Preferred model '${preferredModel}' not available, retrying with fallback model '${fallbackModelName}'`);
        return await tryGenerate(fallbackModelName);
      } catch (listErr) {
        // If listing or retrying fails, rethrow original error to be handled by caller
        console.error('Error listing or trying fallback models:', listErr.message || listErr);
        throw err;
      }
    }
    throw err;
  }
};