import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for the AI
const SYSTEM_PROMPT = `You are an AI assistant that helps users create structured plans for learning, fitness, and nutrition.
Detect the user's intent and generate the appropriate JSON structure.

### 1. Learning Roadmap (Default)
If the user wants to learn a skill or prepare for an exam, use this structure:
{
  "type": "learning",
  "data": [
    {
      "domain": "Broad Domain Name (e.g. AI/ML Engineering)",
      "shortName": "SHORT (e.g. AI/ML)",
      "topics": "Specific Topic Name",
      "subtopics": ["Subtopic 1", "Subtopic 2"]
    }
  ]
}
Rule: Use a SINGLE, BROAD domain name for the user's entire goal. Group related topics under this domain.

### 2. Workout Routine
If the user wants a workout plan, gym routine, or mentions specific splits (e.g., PPL), use this structure:
{
  "type": "workout",
  "data": [
    {
      "name": "Workout Name (e.g. Push Day)",
      "pre_workout_warmup": ["Warmup 1", "Warmup 2"],
      "exercises": [
        {
          "muscle_group": "Target Muscle",
          "movements": ["Exercise 1 – SetsxReps", "Exercise 2"]
        }
      ],
      "post_workout_stretch": ["Stretch 1", "Stretch 2"]
    }
  ]
}
Note: "exercises" can also be a simple array of strings if the workout is simple.

### 3. Diet Plan
If the user wants a diet plan, meal ideas, or nutrition advice, use this structure:
{
  "type": "diet",
  "data": [
    {
      "name": "Meal Name",
      "category": "breakfast", 
      "calories": 350,
      "protein": 20
    }
  ]
}
Note: category must be one of: breakfast, lunch, snack, dinner.

IMPORTANT RULES:
1. Always respond with ONLY valid JSON.
2. The root object MUST have "type" and "data".
3. No markdown, no explanations.`;

// POST /api/ai/generate-roadmap
router.post('/generate-roadmap', optionalAuth, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Prompt is required and must be a non-empty string'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY is missing in backend .env');
            return res.status(500).json({
                error: 'AI service not configured (Missing API Key)'
            });
        }

        const genAITrimmed = new GoogleGenerativeAI(apiKey);
        const model = genAITrimmed.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}\n\nGenerate the JSON plan:`;

        console.log(`🤖 Generating plan for: "${prompt.substring(0, 50)}..."`);

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        console.log('✅ AI Response received (length: ' + text.length + ')');

        text = text.trim();
        text = text.replace(/```json\n?/g, '');
        text = text.replace(/```\n?/g, '');
        text = text.trim();

        let jsonData;
        try {
            jsonData = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('Raw AI Response:', text.substring(0, 500) + '...');
            return res.status(500).json({
                error: 'AI generated invalid JSON. Please try again.',
                rawResponse: text.substring(0, 500)
            });
        }

        // Normalize structure if AI creates a direct array (fallback logic)
        if (Array.isArray(jsonData)) {
            // Assume learning if it looks like learning, otherwise unknown
            if (jsonData[0]?.domain) {
                jsonData = { type: 'learning', data: jsonData };
            } else {
                jsonData = { type: 'unknown', data: jsonData };
            }
        }

        const { type, data } = jsonData;

        if (!type || !Array.isArray(data)) {
            return res.status(500).json({
                error: 'AI generated invalid structure (missing type or data array)',
                data: jsonData
            });
        }

        // Basic validation based on type
        let isValid = true;
        if (type === 'learning') {
            isValid = data.every(item => item.domain && item.topics && item.subtopics);
        } else if (type === 'workout') {
            isValid = data.every(item => item.name && item.exercises);
        } else if (type === 'diet') {
            isValid = data.every(item => item.name && item.category && item.calories !== undefined);
        }

        if (!isValid) {
            console.error('❌ Invalid JSON data schema for type:', type);
            return res.status(500).json({
                error: `AI generated invalid data for ${type}`,
                data: jsonData
            });
        }

        // Return the response
        res.json({
            success: true,
            type: type,
            roadmap: type === 'learning' ? data : undefined, // Legacy support
            workout: type === 'workout' ? data : undefined,
            diet: type === 'diet' ? data : undefined,
            data: data,
            itemCount: data.length // Simplified count
        });

    } catch (error) {
        console.error('🔥 AI Generation Fatal Error:', error);

        let errorMessage = 'Failed to generate roadmap';
        if (error.message.includes('API key not valid')) {
            errorMessage = 'Invalid Gemini API Key';
        } else if (error.message.includes('Quota exceeded')) {
            errorMessage = 'AI Usage Quota Exceeded';
        } else if (error.message.includes('Candidate was blocked')) {
            errorMessage = 'AI Response blocked by safety filters';
        }

        res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
});

export default router;
