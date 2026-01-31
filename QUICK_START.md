# 🤖 AI Chatbot Quick Start

## What You Need to Do

### 1. Get Your Free Gemini API Key (2 minutes)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 2. Add API Key to Backend

Open `/backend/.env` and paste your key:

```bash
GEMINI_API_KEY=AIzaSy...your_key_here
```

### 3. Restart Your Backend

```bash
cd backend
npm run dev
```

### 4. Start Using the AI Assistant!

1. Open your app
2. Go to **Admin** page
3. Click **🤖 AI Assistant** tab
4. Type your goal (e.g., "I want to be an AI/ML engineer in 3 months")
5. Click **Generate Roadmap**
6. Review and import!

## Example Usage

**You type:**
```
I want to crack the CDS exam in 3 months
```

**AI generates:**
```json
[
  {
    "domain": "CDS OTA",
    "shortName": "ENGLISH",
    "topics": "English Fundamentals",
    "subtopics": [
      "Reading Comprehension",
      "Spotting Errors",
      "Sentence Improvement",
      "Fill in the Blanks"
    ]
  },
  {
    "domain": "CDS OTA",
    "shortName": "GK",
    "topics": "Static General Knowledge",
    "subtopics": [
      "Indian History",
      "Indian Polity",
      "Indian Geography"
    ]
  }
]
```

**Then:**
- Click to auto-import to Learning Import tab
- Review the JSON
- Click "Import JSON"
- Start learning! 🚀

## Features

✨ **Smart Generation**: AI understands your goals and creates realistic roadmaps
💬 **Conversation History**: See all your generated roadmaps
🎯 **Example Prompts**: Quick start with pre-made examples
⚡ **One-Click Import**: Automatically formats and imports to your learning domains
🔄 **Iterative**: Generate multiple roadmaps and combine them

## Tips

- Be specific about your timeframe (e.g., "3 months", "6 weeks")
- Mention your current level if relevant (e.g., "beginner", "intermediate")
- You can generate multiple roadmaps and import them all
- The AI learns from your prompt, so be clear about your goals

## Troubleshooting

**"AI service not configured"**
→ Add GEMINI_API_KEY to `/backend/.env` and restart backend

**"Failed to generate roadmap"**
→ Check your internet connection and API key validity

**JSON looks weird**
→ Try rephrasing your prompt or generate again

---

**That's it! You're ready to use AI-powered learning roadmaps! 🎉**
