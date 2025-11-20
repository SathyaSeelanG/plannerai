
# AI-Powered Roadmap Planner

A modern learning roadmap planner with AI-powered content generation and authentication support. Users can create personalized learning paths, track progress, and save their roadmaps either as guests (local storage) or to their accounts (database).


## Features

- 🤖 **AI-Generated Roadmaps**: Create personalized learning paths using Google's Gemini AI
- 🔐 **Authentication**: Secure sign-in with Clerk authentication
- 👤 **Guest Mode**: Browse and create roadmaps without signing up (stored locally)
- 💾 **Dual Storage**: Save to account (Supabase) or local storage for guests
- 📊 **Progress Tracking**: Track your learning progress and statistics
- 🎯 **Interactive UI**: Modern, responsive interface with progress visualization

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Fill in the following variables in `.env`:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `GEMINI_API_KEY`: Your Google Gemini API key (in .env.local)

3. Run the app:
   ```bash
   npm run dev
   ```

## Authentication Modes

### Guest Mode
- Create and view roadmaps without signing up
- Data stored in browser's local storage
- Option to save to account later

### Authenticated Mode
- Sign in using Clerk authentication
- Data synchronized with Supabase database
- Access roadmaps from any device
- Enhanced features and persistence
