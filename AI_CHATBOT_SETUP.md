# AI Chatbot Setup Guide

## Overview
The AI chatbot feature allows users to generate structured learning roadmaps by simply describing their goals. The AI generates a JSON format that can be directly imported into the bulk import system.

## Features
- 🤖 Natural language input for learning goals
- ✨ AI-powered roadmap generation
- 📋 Automatic JSON formatting for bulk import
- 💬 Conversation history
- 🎯 Example prompts for quick start
- ⚡ One-click import to learning domains

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add API Key to Backend

Open `/backend/.env` and add your API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Backend Server

```bash
cd backend
npm run dev
```

## How to Use

### Step 1: Navigate to Admin Page
1. Log in to your account
2. Go to the **Admin** page
3. Click on the **🤖 AI Assistant** tab

### Step 2: Describe Your Goal
Type your learning goal in natural language. Examples:
- "I want to be an AI/ML engineer in next 3 months"
- "I want to crack upcoming CDS exam"
- "I want to learn full-stack web development in 2 months"
- "I want to prepare for GATE Computer Science exam"

### Step 3: Generate Roadmap
1. Click **✨ Generate Roadmap** or press Enter
2. Wait for the AI to generate your personalized roadmap
3. Review the generated domains and topics in the conversation

### Step 4: Import to Learning Domains
1. The generated JSON is automatically populated in the **Learning Import** tab
2. Review the JSON structure
3. Click **Import JSON** to add to your learning domains
4. Start tracking your progress!

## JSON Output Format

The AI generates JSON in this format:

```json
[
  {
    "domain": "Domain Name",
    "shortName": "SHORT",
    "topics": "Topic Name",
    "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
  }
]
```

### Example Output

**Input:** "I want to be an AI/ML engineer in next 3 months"

**Output:**
```json
[
  {
    "domain": "AI/ML",
    "shortName": "AI",
    "topics": "LLM Fundamentals",
    "subtopics": [
      "Tokenization (BPE, WordPiece)",
      "Embeddings and Semantic Space",
      "Attention Mechanism (QKV)",
      "Transformer Architecture",
      "Training vs Inference"
    ]
  },
  {
    "domain": "AI/ML",
    "shortName": "AI",
    "topics": "RAG Architecture",
    "subtopics": [
      "RAG Architecture",
      "Chunking Strategies",
      "Vector Databases (FAISS, Chroma)",
      "RAG Evaluation"
    ]
  }
]
```

## Technical Details

### Backend
- **File:** `/backend/routes/ai.js`
- **Endpoint:** `POST /api/ai/generate-roadmap`
- **Model:** Google Gemini 1.5 Flash
- **Request Body:** `{ "prompt": "your goal here" }`
- **Response:** `{ "success": true, "roadmap": [...], "itemCount": 42 }`

### Frontend
- **Component:** `/frontend/src/components/AIChatbot.jsx`
- **Integration:** Admin page, AI Assistant tab
- **Features:** 
  - Conversation history
  - Example prompts
  - Loading states
  - Error handling
  - Auto-import to bulk import tab

## Troubleshooting

### Error: "AI service not configured"
**Solution:** Make sure you've added `GEMINI_API_KEY` to your `.env` file and restarted the backend server.

### Error: "AI generated invalid JSON"
**Solution:** The AI occasionally generates malformed JSON. Try rephrasing your prompt or click generate again.

### Error: "Failed to generate roadmap"
**Solution:** 
1. Check your internet connection
2. Verify your API key is valid
3. Check if you've exceeded the free tier quota

## API Rate Limits

Google Gemini Free Tier:
- **Requests per minute:** 15
- **Requests per day:** 1,500
- **Tokens per minute:** 1 million

For production use, consider upgrading to a paid plan.

## Privacy & Security

- User prompts are sent to Google's Gemini API
- No conversation history is stored on the server
- API key should be kept secure and never committed to version control
- Add `.env` to `.gitignore` to prevent accidental exposure

## Future Enhancements

Potential improvements:
- [ ] Support for multiple AI providers (OpenAI, Claude, etc.)
- [ ] Save conversation history to database
- [ ] Fine-tune prompts for specific exam types
- [ ] Add difficulty level customization
- [ ] Export roadmaps as PDF
- [ ] Share roadmaps with other users
- [ ] AI-powered progress tracking and recommendations

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend logs
3. Verify your API key is valid
4. Try with a simpler prompt first

---

**Note:** This feature requires an active internet connection and a valid Gemini API key to function.
