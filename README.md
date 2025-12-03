# Ascension - Daily Progress Tracker

A comprehensive web application for tracking your 4-month career transformation journey targeting remote software engineering roles (15-25 LPA).

## 🎯 Features

### ✅ Implemented

- **Dashboard**: Real-time metrics, XP/level system, activity heatmap, quick actions
- **Daily Check-In**: Morning priorities, task completion with undo, evening review
- **Academics**: DSA problem tracker, AI/ML module management
- **Settings**: Profile customization, theme toggle, daily goals

### 🔄 Coming Soon

- Gym & Health tracking
- Social & Goals management
- Job Hunt tracker
- Analytics & Insights
- Gamification (badges, challenges)
- Browser notifications

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 💻 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS Variables
- **State**: React Context API
- **Storage**: LocalStorage

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── checkin/           # Daily check-in
│   ├── academics/         # DSA & AI/ML
│   ├── settings/          # Settings
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Navigation.tsx
│   ├── MetricCard.tsx
│   ├── ActivityHeatmap.tsx
│   ├── QuickActionButton.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── contexts/              # State management
│   └── AppContext.tsx
├── lib/                   # Utilities
│   ├── storage.ts         # LocalStorage
│   ├── calculations.ts    # Core logic
│   └── notifications.ts   # Notifications
└── types/                 # TypeScript types
    └── index.ts
```

## 🎨 Design Principles

- **Frictionless**: Max 2 taps to log anything
- **Instant Feedback**: Toast notifications for all actions
- **Mobile-First**: Responsive design for all devices
- **Privacy-Focused**: All data stays local
- **Consistent Colors**: Green=complete, Red=missed, Yellow=in-progress

## 📊 Data Management

All data is stored in browser LocalStorage:
- Automatic saving on every change
- Survives page refreshes
- No server required
- Export/import capabilities (coming soon)

## 🎮 Gamification

- **XP System**: Earn points for every activity
  - Easy DSA: 10 XP
  - Medium DSA: 25 XP
  - Hard DSA: 50 XP
  - AI Module: 30 XP
  - Gym Session: 20 XP
- **Levels**: 1-20 (500 XP per level)
- **Streaks**: Track consecutive active days

## 📝 License

Private project for personal use.

## 🙏 Acknowledgments

Built with Next.js, React, and TypeScript.
