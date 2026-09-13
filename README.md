# தமிழ் AI Video Studio

Script `.txt` upload/paste செய்து AI video உருவாக்கும் Next.js website.

## முக்கிய அம்சங்கள்

- தமிழ் UI
- `.txt` script upload
- Script textarea
- AI video generation
- Generation status polling
- Video preview
- Video output link
- Local video history database in `data/videos.json`
- Demo mode works without an API key
- Delete saved video records
- API token browser-ல் expose ஆகாது

## 1. Requirements

- Node.js 20+
- Replicate account + API token

Replicate official models-ல் `heygen/video-agent` பயன்படுத்தப்படுகிறது. இது text prompt-ல் இருந்து script, avatar/presenter, voiceover, visuals மற்றும் editing உடன் complete video உருவாக்கும் model.

## 2. Install

```bash
npm install
```

Without `REPLICATE_API_TOKEN`, the app runs in free demo mode and saves test jobs locally. Add the token to generate real videos.

## 3. Environment

`.env.example` ஐ `.env.local` என்று copy செய்து:

```env
REPLICATE_API_TOKEN=r8_your_token_here
```

உங்கள் Replicate API token-ஐ மட்டும் server environment-ல் வையுங்கள்.

## 4. Run

```bash
npm run dev
```

பிறகு:

```text
http://localhost:3000
```

## 5. Production build

```bash
npm run build
npm start
```

## Production notes

இந்த starter demo video URL-ஐ database-ல் save செய்யாது. Production version-ல்:

- Login / signup
- User dashboard
- PostgreSQL
- Object storage (S3/R2)
- Job queue
- Webhook-based status updates
- Usage credits
- Payment integration
- Rate limiting
- Admin dashboard
- Custom domain
- Terms / privacy pages

போன்றவை சேர்க்க வேண்டும்.
