import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for the AI
const SYSTEM_PROMPT = `You are an AI assistant that helps users create structured learning roadmaps. 
When a user describes their goal (e.g., "I want to be an AI/ML engineer in 3 months" or "I want to crack the CDS exam"), 
you should generate a comprehensive JSON array of learning domains, topics, and subtopics.

IMPORTANT RULES:
1. Always respond with ONLY valid JSON - no markdown, no explanations, no code blocks
2. Use this exact structure:
[
  {
    "domain": "Broad Domain Name",
    "shortName": "SHORT",
    "topics": "Specific Topic Name",
    "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
  }
]

3. **CRITICAL: GROUPING RULE**: Use a SINGLE, BROAD domain name for the user's entire goal.
   - If the user wants "AI/ML", EVERYTHING (Python, Math, Deep Learning, MLOps) must have the exact same domain: "AI/ML Engineering".
   - Do NOT split into "Math for ML", "Python", "Deep Learning". They should all be distinct 'topics' under the SAME 'domain'.
   - Only create separate domains if the user asks for two completely unrelated goals (e.g. "GATE Exam" and "Cooking").

4. Be comprehensive but realistic based on the timeframe.
5. Break down complex topics into actionable subtopics.

Example for "AI/ML engineer in 3 months":
[
  {
    "domain": "AI/ML Engineering",
    "shortName": "AI/ML",
    "topics": "Prerequisites & Math",
    "subtopics": ["Python Basics", "Linear Algebra", "Calculus for ML", "Statistics & Probability"]
  },
  {
    "domain": "AI/ML Engineering",
    "shortName": "AI/ML",
    "topics": "Deep Learning Fundamentals",
    "subtopics": ["Neural Networks", "Backpropagation", "CNNs", "RNNs & LSTMs"]
  },
  {
    "domain": "AI/ML Engineering",
    "shortName": "AI/ML",
    "topics": "Modern NLP & LLMs",
    "subtopics": ["Transformers", "Attention Mechanism", "Fine-tuning", "RAG Architecture"]
  }
]
Notice how "domain" is identical for all entries. This is required.

Remember: Output ONLY the JSON array, nothing else.`;

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

        // Check if API key is configured
        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY is missing in backend .env');
            return res.status(500).json({
                error: 'AI service not configured (Missing API Key)'
            });
        }

        // Initialize with trimmed key
        const genAITrimmed = new GoogleGenerativeAI(apiKey);
        const model = genAITrimmed.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        // Combine system prompt with user prompt
        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Goal: ${prompt}\n\nGenerate the JSON roadmap:`;

        console.log(`🤖 Generating roadmap for: "${prompt.substring(0, 50)}..."`);

        // Generate content
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        console.log('✅ AI Response received (length: ' + text.length + ')');

        // Clean up the response - remove markdown code blocks if present
        text = text.trim();
        text = text.replace(/```json\n?/g, '');
        text = text.replace(/```\n?/g, '');
        text = text.trim();

        // Validate JSON
        let jsonData;
        try {
            jsonData = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('Raw AI Response:', text.substring(0, 500) + '...');
            return res.status(500).json({
                error: 'AI generated invalid JSON. Please try again.',
                rawResponse: text.substring(0, 500) // First 500 chars for debugging
            });
        }

        // Ensure it's an array
        if (!Array.isArray(jsonData)) {
            jsonData = [jsonData];
        }

        // Validate structure
        const isValid = jsonData.every(item =>
            item.domain &&
            item.shortName &&
            item.topics &&
            item.subtopics
        );

        if (!isValid) {
            console.error('❌ Invalid JSON structure received');
            return res.status(500).json({
                error: 'AI generated data with invalid structure',
                data: jsonData
            });
        }

        // Return the generated roadmap
        res.json({
            success: true,
            roadmap: jsonData,
            itemCount: jsonData.reduce((sum, item) => {
                const subtopics = Array.isArray(item.subtopics) ? item.subtopics : [item.subtopics];
                return sum + subtopics.length;
            }, 0)
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
