# gr-ui-variant-1

GigRadar mobile-web UI (Vite + React + TypeScript).

## Local development

```bash
npm install
npm run dev
```

## Assets folder

Drop your images into:

`public/assets/`

Then reference them in code like:

`/assets/your-image-name.jpg`

## Deploy to Vercel

This repo is ready for Vercel static deployment (`vercel.json` is included).

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New Project** and import the repo.
3. Confirm settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

For subsequent pushes, Vercel auto-redeploys.