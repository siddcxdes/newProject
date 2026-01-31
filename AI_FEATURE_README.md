# 🤖 AI-Powered Learning Roadmap Generator

## Overview

The AI Chatbot feature transforms how you plan your learning journey. Simply describe your goal in natural language, and our AI assistant generates a comprehensive, structured roadmap that's ready to import into your learning domains.

![AI Chatbot Interface](./ai_chatbot_preview.png)

## ✨ Key Features

### 🎯 Natural Language Input
No need to manually create JSON structures. Just tell the AI what you want to learn:
- "I want to be an AI/ML engineer in 3 months"
- "I want to crack the CDS exam"
- "I want to learn full-stack development"

### 🧠 Intelligent Roadmap Generation
The AI analyzes your goal and creates:
- **Relevant domains** based on your objective
- **Structured topics** organized by learning path
- **Actionable subtopics** you can track and complete
- **Realistic scope** based on your timeframe

### 💬 Interactive Chat Interface
- **Conversation history** - See all your generated roadmaps
- **Example prompts** - Quick start with pre-made examples
- **Real-time feedback** - Know exactly what's being generated
- **Error handling** - Clear messages if something goes wrong

### ⚡ One-Click Import
Generated roadmaps are automatically:
- Formatted as valid JSON
- Populated in the bulk import field
- Ready to import with a single click
- Integrated with your existing learning domains

## 🚀 Quick Start

### 1. Get Your API Key (Free)
```bash
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
```

### 2. Configure Backend
```bash
# Add to /backend/.env
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Backend
```bash
cd backend
npm run dev
```

### 4. Use the AI Assistant
1. Navigate to **Admin** page
2. Click **🤖 AI Assistant** tab
3. Describe your goal
4. Generate and import!

## 📋 How It Works

### Input Example
```
I want to be an AI/ML engineer in next 3 months
```

### AI Output
```json
[
  {
    "domain": "Data Structures",
    "shortName": "DSA",
    "topics": "Revision + Maintenance",
    "subtopics": [
      "Arrays",
      "Hash Maps",
      "Two Pointers",
      "Sliding Window",
      "Stacks",
      "Queues",
      "Binary Search"
    ]
  },
  {
    "domain": "AI/ML",
    "shortName": "AI",
    "topics": "LLM Fundamentals",
    "subtopics": [
      "Tokenization (BPE, WordPiece)",
      "Embeddings and Semantic Space",
      "Attention Mechanism (QKV)",
      "Transformer Architecture",
      "Training vs Inference",
      "Sampling (Temperature, Top-k, Top-p)"
    ]
  }
]
```

### Result
✅ 42 learning items across 8 domains
✅ Automatically formatted for import
✅ Ready to track in your dashboard

## 🎨 User Interface

The chatbot features a modern, intuitive interface:

- **Dark theme** with glassmorphism effects
- **Color-coded messages** (User: Blue, AI: Green, Errors: Red)
- **Example prompts** for quick inspiration
- **Loading animations** during generation
- **Responsive design** works on all devices

## 🔧 Technical Details

### Backend
- **Framework:** Express.js
- **AI Model:** Google Gemini 1.5 Flash
- **Endpoint:** `POST /api/ai/generate-roadmap`
- **File:** `/backend/routes/ai.js`

### Frontend
- **Component:** `AIChatbot.jsx`
- **Integration:** Admin page, AI Assistant tab
- **State Management:** React hooks

### API Integration
```javascript
// Request
POST /api/ai/generate-roadmap
{
  "prompt": "I want to be an AI/ML engineer in 3 months"
}

// Response
{
  "success": true,
  "roadmap": [...],
  "itemCount": 42
}
```

## 💡 Use Cases

### Exam Preparation
```
"I want to crack the CDS exam in 3 months"
```
→ Generates focused study plan with high-ROI topics

### Skill Development
```
"I want to become a full-stack developer"
```
→ Creates comprehensive learning path from basics to advanced

### Career Transition
```
"I want to switch to AI/ML engineering from web development"
```
→ Builds bridge curriculum leveraging existing skills

### Interview Prep
```
"I want to prepare for FAANG interviews in 2 months"
```
→ Structures DSA practice with system design topics

## 📊 Benefits

### Time Saving
- **Manual planning:** 2-3 hours
- **AI generation:** 10 seconds
- **Savings:** 99% faster

### Quality
- Comprehensive coverage of topics
- Realistic scope based on timeframe
- Industry-relevant subtopics
- Structured learning path

### Flexibility
- Generate multiple roadmaps
- Combine different goals
- Iterate and refine
- Customize after import

## 🔒 Privacy & Security

- ✅ Prompts sent to Google Gemini API
- ✅ No conversation history stored on server
- ✅ API key secured in environment variables
- ✅ No personal data collected
- ✅ HTTPS encryption for API calls

## 📈 API Limits (Free Tier)

Google Gemini Free Tier:
- **15 requests/minute**
- **1,500 requests/day**
- **1M tokens/minute**

Perfect for personal use! Upgrade for production.

## 🛠️ Troubleshooting

### "AI service not configured"
**Cause:** Missing API key
**Fix:** Add `GEMINI_API_KEY` to `/backend/.env` and restart

### "AI generated invalid JSON"
**Cause:** AI output formatting issue
**Fix:** Try rephrasing your prompt or generate again

### "Failed to generate roadmap"
**Cause:** Network or API issue
**Fix:** Check internet connection and API key validity

### Rate limit exceeded
**Cause:** Too many requests
**Fix:** Wait a minute or upgrade to paid tier

## 🎯 Best Practices

### Writing Effective Prompts

✅ **Good:**
- "I want to be an AI/ML engineer in 3 months"
- "I want to crack GATE CS exam with focus on algorithms"
- "I want to learn React and Node.js for full-stack development"

❌ **Avoid:**
- "Teach me everything"
- "I want to learn" (too vague)
- "Make me smart" (not specific)

### Tips
1. **Be specific** about your goal
2. **Mention timeframe** (e.g., "3 months")
3. **State your level** if relevant (beginner/intermediate)
4. **Focus on one goal** per prompt
5. **Review before importing** - customize as needed

## 🚀 Future Enhancements

Planned features:
- [ ] Multiple AI provider support (OpenAI, Claude)
- [ ] Save conversation history
- [ ] Export roadmaps as PDF
- [ ] Share roadmaps with community
- [ ] AI-powered progress tracking
- [ ] Personalized recommendations
- [ ] Difficulty level customization
- [ ] Multi-language support

## 📚 Resources

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API key
- [Gemini API Docs](https://ai.google.dev/docs) - API documentation
- [Setup Guide](./AI_CHATBOT_SETUP.md) - Detailed setup instructions
- [Quick Start](./QUICK_START.md) - Get started in 2 minutes

## 🤝 Contributing

Ideas for improvement? Found a bug? 
- Open an issue
- Submit a pull request
- Share your feedback

## 📄 License

This feature is part of the Ascension project.

---

**Made with ❤️ and AI to help you achieve your learning goals faster!**
