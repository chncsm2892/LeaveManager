# HR Holiday & Leave Manager

A production-ready Vite React app for tracking company holidays, employee leave balances, unpaid leave, and sending holiday email announcements.

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

Use these settings:

- Framework Preset: Vite
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist

The included `vercel.json` also sets SPA rewrites so refreshes and direct URLs do not show 404.

## Email feature

The app includes two email options:

1. `Open Email App` uses `mailto:` and works without setup.
2. `Copy Email Draft` copies recipients, subject, and message so you can paste into Gmail/Outlook.

For real automatic email sending, connect this app to a backend service such as Resend, SendGrid, Supabase Edge Functions, or your own API.
