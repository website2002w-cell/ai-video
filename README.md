# Tamil AI Video Studio

Tamil script upload or paste செய்து real MP4 AI video உருவாக்கும் Next.js app.

Features
Tamil voice, presenter/avatar, automatic scenes, Tamil subtitles, 9:16 Reels or 16:9 YouTube, 15 to 120 second duration, MP4 preview/download, and My Videos history.

Setup

npm install
npm run dev

Create .env.local in the project root. Keep the real token only in this file:

REPLICATE_API_TOKEN=r8_your_real_token_here

The server code uses the fixed model heygen/video-agent. Never commit .env.local; .gitignore keeps env files private.

Without a token, the app runs local demo mode. With a valid Replicate token and credits, it creates a real AI video.
