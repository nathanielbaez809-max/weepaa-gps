# 🚀 Weepaa Truck GPS - Deployment Guide

This guide covers everything you need to know to deploy the Weepaa Truck GPS application to production.

## ✅ Prerequisites

Before deploying, ensure your environment is ready:

- **Node.js**: Version 20.19+ or 22.12+ (Required by Vite 6)
- **npm**: Version 10+
- **Git**: Installed and configured

## 🛠️ Pre-Deployment Verification

Always run these checks locally before pushing code:

1.  **Linting**: Ensure code quality and catch potential bugs.
    ```bash
    npm run lint
    ```
    *Fix any errors before proceeding.*

2.  **Type Checking**: Verify TypeScript types.
    ```bash
    npx tsc --noEmit
    ```

3.  **Production Build**: Verify the app builds successfully.
    ```bash
    npm run build
    ```
    *This generates the `dist/` folder.*

4.  **Preview**: Test the production build locally.
    ```bash
    npm run preview
    ```
    *Open the provided URL (usually http://localhost:4173) to verify the app works as expected.*

## ☁️ Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for React/Vite apps with zero config.

1.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

2.  **Import in Vercel**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **"Add New..."** -> **"Project"**.
    - Select your `weepaa-gps` repository.

3.  **Configure Project**:
    - **Framework Preset**: Vite (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).

4.  **Environment Variables**:
    Add these in the "Environment Variables" section:
    - `VITE_FIREBASE_API_KEY`: Your Firebase API Key
    - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain
    - `VITE_FIREBASE_PROJECT_ID`: Your Firebase Project ID
    - `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Messaging Sender ID
    - `VITE_FIREBASE_APP_ID`: Your Firebase App ID
    - `VITE_GEMINI_API_KEY`: (Optional) For AI features

5.  **Deploy**: Click **"Deploy"**.

### Option 2: Netlify

1.  **Drag & Drop**:
    - Run `npm run build`.
    - Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop).

2.  **Git Integration**:
    - Connect GitHub repo.
    - Build command: `npm run build`.
    - Publish directory: `dist`.

## 📱 PWA (Progressive Web App) Notes

Weepaa is configured as a PWA. For it to work correctly in production:

- **HTTPS is Required**: Service workers only run on secure origins (HTTPS) or `localhost`.
- **Manifest**: Ensure `public/manifest.webmanifest` exists and is referenced in `index.html` (Vite handles this).
- **Icons**: Ensure `pwa-192x192.png` and `pwa-512x512.png` are in `public/`.

## 🔍 Troubleshooting

- **"Vite requires Node.js version..."**: Upgrade your Node.js version on the deployment server (in Vercel, go to Settings -> General -> Node.js Version).
- **White Screen on Load**: Check console for errors. Often due to missing environment variables or client-side routing issues (ensure `vercel.json` rewrite rules are present).
- **PWA Not Installable**: Run a Lighthouse audit in Chrome DevTools to see missing PWA criteria.

## 🔄 Continuous Deployment

With Vercel/Netlify connected to GitHub, every push to `main` will automatically trigger a new deployment.

---
*Happy Trucking! 🚛*
