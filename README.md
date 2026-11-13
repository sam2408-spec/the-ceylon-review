# The Ceylon Review (TCR)

> *"Everything is connected. Nothing is neutral."*

**The Ceylon Review** is an investigative journalism web application and digital broadsheet newsroom designed to present in-depth dispatches, historical records, geopolitical critiques, and investigative reporting with the editorial gravitas of a classic investigative newspaper.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Editorial Desk & Content Management (CMS)](#editorial-desk--content-management-cms)
  - [Launching Editorial Mode](#launching-editorial-mode)
  - [Publishing & Editing Dispatches](#publishing--editing-dispatches)
  - [Managing Contributors](#managing-contributors)
  - [Exporting & Importing State (JSON)](#exporting--importing-state-json)
- [Mobile & Android Packaging](#mobile--android-packaging)
- [Code Quality & Linting](#code-quality--linting)
- [License](#license)

---

## 🗞️ Overview

The Ceylon Review blends modern web performance with timeless print journalism aesthetics:
- **Broadsheet Typography**: Serif headlines, drop-caps, pull quotes, and legislative timeline formatting.
- **Warm Newsprint Palette**: Rich charcoal blacks (`#141110`), deep crimson headers (`#580a0a`), warm parchment tones (`#f5eedc`), and antiqued paper cards (`#ebdcb9`).
- **Complete Editorial Autonomy**: Includes an in-browser Sovereign Editorial Desk allowing reporters to write, edit, delete, and curate dispatches, manage author profiles, and backup or restore all publications as JSON.

---

## ✨ Key Features

1. **Front-Page Broadside (Cover Mode)**
   - Fold-out paper-style hero presentation highlighting lead investigations and breaking headlines.
   - Quick statistics: total dispatches, active investigative files, and registered correspondents.

2. **Curated Dispatches Stream**
   - Filter between **Current Dispatches** and **Archival Records**.
   - Topic tagging (*Foreign Interference, Sovereign Debt, Digital Governance, Civil Liberties, Energy Sovereignty*).
   - Fast full-text search across titles, summaries, contents, and author bylines.

3. **In-Depth Reader Modal**
   - Formatted editorial layout featuring drop caps, metadata timestamps, and pull quotes.
   - Reader interaction: citizen recommendations (likes counter), saved clippings, direct link copying, and public commentary board.
   - Full keyboard accessibility (Close with `Escape`, automatic background scroll lock).

4. **Saved Clippings (Bookmarks Drawer)**
   - Keep a personal ledger of articles saved for offline or subsequent reading.
   - Persisted locally in browser storage (`localStorage`).

5. **Sovereign Editorial Desk (In-Browser CMS)**
   - Toggleable from the header masthead button.
   - **Publishing Suite**: Rich dispatch editor with Markdown/paragraph formatting, cover photo uploads/URLs, reading time calculation, and importance classification.
   - **Contributor Desk**: Create and edit investigative author profiles with custom bios, beats, and portraits.
   - **Data Backup & Restore**: Export the complete dispatch ledger to `.json` or import previously archived dispatches with one click.

6. **Multimedia Press Room & Lightbox**
   - Video press briefings and investigative field broadcasts.
   - High-resolution photographic evidence gallery with an interactive modal lightbox.

7. **Legal & Sovereign Disclaimers**
   - Integrated regulatory directive, whistleblower privacy defense protocols, and liability disclaimers.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mobile Container**: [Capacitor](https://capacitorjs.com/) (configured for Android build pipelines)

---

## 📂 Project Structure

```text
├── android/                   # Native Android project wrapper (Capacitor)
├── src/
│   ├── components/            # UI & Editorial Components
│   │   ├── ArticleCard.tsx             # Dispatch preview card with image fallbacks
│   │   ├── ArticleDetailModal.tsx      # In-depth broadsheet reading modal & comments
│   │   ├── BookmarksDrawer.tsx         # Saved clippings side drawer
│   │   ├── HeaderMasthead.tsx          # Broadsheet header, date line & navigation
│   │   ├── MediaHub.tsx                # Video briefings & photo evidence gallery
│   │   ├── SovereignEditorialDesk.tsx  # In-browser CMS (editor, writers, JSON sync)
│   │   └── WriterProfileView.tsx       # Author dossier & contributor portfolio
│   ├── App.tsx                # Root application controller & tab router
│   ├── initialData.ts         # Pre-seeded investigative dispatches & writer profiles
│   ├── types.ts               # Core TypeScript models (Article, Writer, Comment, etc.)
│   ├── index.css              # Global styles & typography definitions
│   └── main.tsx               # React application entry point
├── public/                    # Static assets
├── capacitor.config.ts        # Capacitor configuration
├── ANDROID_INSTRUCTIONS.md    # Step-by-step instructions for Android APK builds
├── metadata.json              # App metadata and permissions
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compiler settings
└── vite.config.ts             # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**: installed on your machine

### 1. Running on Localhost

Clone or extract the repository onto your machine:

```bash
# Navigate to the project directory
cd the-ceylon-review

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```
*(If port 3000 is occupied, Vite will automatically suggest `http://localhost:5173` or another open port).*

---

## 🌐 Pushing to GitHub & Deploying Live to Vercel

### Step 1: Push Code to GitHub

1. **Initialize Git & commit files** (in your local project folder):
   ```bash
   git init
   git add .
   git commit -m "Initial release of The Ceylon Review"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter a name (e.g. `the-ceylon-review`).
   - Keep it **Public** or **Private**, and **leave "Initialize with README" unchecked**.
   - Click **Create repository**.

3. **Link and push to GitHub**:
   ```bash
   # Rename branch to main
   git branch -M main

   # Add your GitHub remote URL (replace YOUR-USERNAME and REPO-NAME)
   git remote add origin https://github.com/YOUR-USERNAME/the-ceylon-review.git

   # Push your code
   git push -u origin main
   ```

---

### Step 2: Deploying to Vercel (Live Hosting)

Vercel provides free, continuous deployment directly from your GitHub repository.

#### Method A: Connect via the Vercel Web Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in (or sign up with your GitHub account).
2. Click **"Add New..."** > **"Project"**.
3. Under **"Import Git Repository"**, select your `the-ceylon-review` repository and click **Import**.
4. In the Project Configuration:
   - **Framework Preset**: Vite *(automatically detected)*
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` *(auto-configured via `vercel.json`)*
   - **Output Directory**: `dist` *(auto-configured via `vercel.json`)*
5. Click **Deploy**.
6. Within 1–2 minutes, Vercel will build and assign you a free production URL (e.g., `https://the-ceylon-review.vercel.app`).
7. Any future commits pushed to your `main` branch will automatically re-deploy to your live site!

#### Method B: Deploy using the Vercel CLI (Optional)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Log in and deploy
vercel

# For production deployment
vercel --prod
```

---

## 🖋️ How to Post New Articles Every Week (Editor Workflow)

As the Editor-in-Chief, you have **two straightforward ways** to publish your weekly editions:

---

### Option A: Direct In-Browser Publishing (Fastest & No Code)

1. Open your live website.
2. In the top masthead bar, click **"Editor Access"** (or the lock/unlock button). This unlocks editorial privileges and reveals the floating **"CMS Editorial Desk"** button in the bottom right corner.
3. Click **"CMS Editorial Desk"**.
4. In the **"Manage Dispatches"** tab, click **"+ Compose New Dispatch"**:
   - Fill in the **Dispatch Title**, **Deck / Subtitle**, and **Desk Category** (*Politics, Opinion, Business, Culture, Tech, Science*).
   - Select the **Byline Author** from your roster.
   - Enter estimated **Read Time** (e.g., `6 min read`).
   - Paste a **Cover Image URL** (from Unsplash or your asset host).
   - Enter a brief 2-sentence **Summary** for the front page card.
   - Paste your **Full Article Body** in the text area (separate paragraphs with blank lines / double Enter).
   - Check **"Publish to Current News Stream"** (and optionally **"Pin as Lead Featured Banner"**).
5. Click **"Publish Dispatch"**. The article is live immediately on your screen and saved to browser memory!
6. **To back up your work**: Open the **"CMS Backups & Options"** tab inside the desk and click **"Export Backup"** to download `the_ceylon_review_editorial_backup_<date>.json`.

> 💡 **Tip:** To edit any existing article's text, category, or summary, open the article in standard view and click the **"Modify Article"** button at the top of the reading modal.

---

### Option B: Publishing for All Global Visitors on Vercel (Permanent Weekly Edition)

When your site is deployed on Vercel, visitors across the world load the default articles defined in the repository. To update the site for **every reader globally** each week:

1. Open `src/initialData.ts` in your code editor (or directly in GitHub by clicking the ✏️ edit icon).
2. Find `INITIAL_ARTICLES` and paste your new article at the top of the array:
   ```ts
   {
     id: 'art-week-28-investigation',
     title: 'Your Article Title Here',
     subtitle: 'Your Subtitle Here',
     summary: 'Brief 2-sentence hook for the card display.',
     content: [
       "First paragraph of your article...",
       "Second paragraph of your article...",
       "Third paragraph..."
     ],
     authorId: 'w-sameera', // or other writer ID from INITIAL_WRITERS
     publishedAt: 'July 15, 2026',
     category: 'Politics',
     imageUrl: 'https://images.unsplash.com/...',
     readTime: '6 min read',
     isCurrent: true,
     isFeatured: true,
     likes: 0,
     comments: [],
     views: 0
   },
   ```
3. Commit and push your changes to GitHub:
   ```bash
   git add src/initialData.ts
   git commit -m "Publish Weekly Issue: July 15, 2026 Edition"
   git push origin main
   ```
4. **Vercel will automatically build and deploy the update in ~60 seconds**. Every visitor worldwide will immediately see your new weekly lead story!

---

### Option C: Cloud Database Integration (Real-Time Global CMS)

If you prefer to publish articles from the browser UI and have them automatically appear for all visitors globally in real time (without using Git or modifying code), we can connect **Firebase Firestore**. Whenever you click "Publish Dispatch" in the browser, it syncs instantly to cloud storage. Let us know if you'd like this enabled!

---

## 📱 Mobile & Android Packaging

This application is ready for native Android packaging via **Capacitor**:

1. Build the web distribution:
   ```bash
   npm run build
   ```
2. Sync the web assets to the Android container:
   ```bash
   npx cap sync android
   ```
3. Open in Android Studio to build APK or AAB:
   ```bash
   npx cap open android
   ```

*For detailed instructions on Android SDK configuration, permissions, and APK signing, see [`ANDROID_INSTRUCTIONS.md`](./ANDROID_INSTRUCTIONS.md).*

---

## 🧪 Code Quality & Linting

Run TypeScript type checks:

```bash
npm run lint
```

Test the production compilation:

```bash
npm run build
```

---

## ⚖️ License

The Ceylon Review codebase is released under the **MIT License**. Investigative content and dispatches are published under sovereign public record guidelines.
