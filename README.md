# Tamil AI Video Studio

Tamil script upload or paste செய்து real MP4 AI video உருவாக்கும் Next.js app.

## Features

- Tamil voice and presenter/avatar instructions
- - Automatic scenes, visuals, and Tamil subtitles
  - - 9:16 Reels/Shorts or 16:9 YouTube
    - - 15-120 second duration and optional HeyGen avatar ID
      - - MP4 preview/download and local My Videos history
        - - Demo mode without a token
         
          - ## Setup
         
          - ```bash
            npm install
            npm run dev
            ```

            Create `.env.local` in the project root with your private token:

            ```env
            REPLICATE_API_TOKEN=r8_your_real_token_here
            ```

            The model is fixed in server code as `heygen/video-agent`. Never commit `.env.local`; `.gitignore` keeps `.env*` ignored while allowing `.env.example`.

            Open http://localhost:3000. Real generation requires a Replicate account and credits. Without a token, local demo mode is used.
