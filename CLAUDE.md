# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

宋韵照片生成 H5 应用，用于线下活动互动体验。用户上传照片，选择宋韵风格模板，由通义万相 AI 生成宋韵版照片。

## Commands

### Development
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Test Tongyi API
```bash
npx tsx scripts/test-tongyi.ts  # Test image generation with 4 styles
```

## Architecture

### Frontend (Vue 3)
- `src/screens/` - Two main pages:
  - `MobileScreen.vue` - User flow: upload → select style → generate → download
  - `DisplayScreen.vue` - Large screen display: queue stats + results carousel
- `src/modules/` - Feature modules (upload, style-selection, generation, consent)
- `src/stores/` - Pinia state management (taskStore, displayStore)
- `src/shared/` - Reusable components and utilities

### Backend (Vercel Serverless)
- `api/task/` - Task creation and status query
- `api/display/` - Queue stats and recent results
- `lib/ai/tongyi.ts` - Tongyi Wanxiang API client

### Key Flow
```
User uploads photo → Compress to 1MB/1024px → Select style →
Create task → Poll status (3s interval) → Download result
```

## Four Song Styles

| ID | Name | Description |
|----|------|-------------|
| ink-wash | 水墨风 | Chinese ink wash painting, monochrome |
| gongbi | 工笔画 | Detailed brushwork, fine lines |
| shinv | 仕女图 | Song dynasty court lady painting |
| landscape | 山水意境 | Song dynasty landscape, misty mountains |

Thumbnails stored in `public/images/styles/`.

## Environment Variables

Required:
- `TONGYI_API_KEY` - DashScope API key

Optional (for production):
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` - Vercel KV for queue management
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob for image storage

## Styling

- Theme: Song dynasty aesthetics (dark blue background, gold/red accents)
- No emojis in UI text (per user requirement)
- Fonts: Noto Serif SC, Ma Shan Zheng
- Colors defined in `tailwind.config.js` (song-bg-dark, song-accent, song-gold, etc.)

## Deployment

Deploy to Vercel:
```bash
vercel
```

Mobile page: `/` | Display page: `/display`

## Important Notes

- Images are compressed client-side before upload
- User consent required before showing on display screen
- WebSocket connection with polling fallback for real-time sync
- Task polling max 40 iterations (2 minutes)