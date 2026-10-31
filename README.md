# AarogyaTrack — Every Visit Matters
> **Hackathon Submission:** `Hacktoberfest-bhopal-AarogyaTrack`  
> **Tagline:** Offline-First Clinical Record and Longitudinal Health Monitoring PWA for Travelling Medical Teams.  
> 🎬 **[Watch Project Walkthrough Video](brag-output/brag.mp4)** &bull; 🖼️ **[Launch Video Kit &amp; Poster](brag-output/index.html)**

---

## 🌟 The Problem
Travelling doctors and primary healthcare workers conducting periodic rural medical camps face a critical challenge:
1. **Zero / Intermittent Connectivity:** Cloud-only apps crash or stall in remote regions.
2. **Broken Continuity of Care:** Patient histories are scattered across lost paper slips and disconnected records.
3. **No Longitudinal Context:** Clinicians cannot easily track multi-month trends in blood pressure, glucose, or medication response.

---

## 💡 The Solution
**AarogyaTrack** is an offline-first clinical workspace engineered for rural health equity:
- **Smart Rx Writepad & Voice Dictation:** Realistic doctor writepad supporting freeform natural shorthand, 1-click clinical quick stamps (`+ Complaint`, `+ Diagnosis`, `+ Medicine`), preset quick test cases (Skin/Hairfall, Acute Fever, Chronic BP), and real-time voice dictation with live clinical extraction.
- **Dual-Mode Clinical Capture:** Flexibility to choose between the **Smart Rx Writepad** (for symptom/general consultations) and the **Structured Form** (for deep objective measurements & vitals).
- **Printable Clinical Rx Slip (100% Offline):** One-click A5 prescription slip generation with watermark, patient demographics band, vitals ribbon, diagnosis, treatment, doctor's verbatim note, and signature line.
- **Clinical Skeleton Screens:** Zero-layout-shift, Hallmark-crafted shimmering skeleton screens for patient clinical files, dashboard metrics, and AI longitudinal synthesis.
- **Offline-First Resilience:** Record consultations and vitals with zero cell signal via local **IndexedDB (Dexie.js)** and client-side UUIDs.
- **Idempotent Background Synchronization:** Automatically queues outbox operations and syncs to PostgreSQL when connectivity returns.
- **Longitudinal Trend Visualization:** Interactive charts (**Recharts**) showing multi-visit physiological trajectories with traceable clinical notes.
- **Assistive AI Powered by Google Gemini:** Deep longitudinal synthesis, screening gap detection, and structured clinical reviews across months of history. Strict clinician-in-the-loop review.
- **Hallmark Anti-AI-Slop Design System:** Styled using Nutlope's Hallmark principles—calm clinical "Specimen" theme, tokenized CSS, high-contrast accessible typography, and zero generic marketing templates.

---

## 🛠️ Architecture & Tech Stack

```text
Doctor / Mobile Health Worker
            │
            ▼
React + Vite + TypeScript PWA (Hallmark Design Tokens)
   │                                     │
   ▼ (Online API)                        ▼ (Offline Cache)
Express REST API                    IndexedDB (Dexie.js)
   │                                     │
   ├─► PostgreSQL (Prisma ORM)          └─► Outbox Queue ──► Sync API
   │
   ├─► Google Gemini (Deep Longitudinal Reasoning)
   └─► Groq (Ultra-Fast Visit Structuring)
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Hallmark Design System), Dexie.js, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon / Supabase), Zod, JWT.
- **AI Engines:** `@google/generative-ai` (Gemini 1.5 Flash), `groq-sdk` (Llama 3.3).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (Neon or Supabase)

### 2. Configure Environment Variables
Create `.env` in `/server`:
```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="aarogyatrack-jwt-dev-secret-key-32chars"

# Dual-Engine AI Keys
GEMINI_API_KEY="your-google-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"
```

### 3. Push Database Schema & Seed Synthetic Demo Records
```bash
# Push Prisma schema to Postgres
npm --prefix server run prisma:push

# Seed realistic demo patients (Ramesh Kumar - Hypertensive trajectory across 3 visits)
npm --prefix server run seed
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend API (Port 5000)
npm run dev:server

# Terminal 2 - Frontend Client (Port 5173)
npm run dev:client
```
Open **`http://localhost:5173`** in your browser.

---

## Walkthrough

1. **Sign In:** Click **"Autofill Verified Demo Account"** to sign in as *Dr. Priya Sharma, MD*.
2. **Explore Longitudinal Continuity:**
   - Select patient **Ramesh Kumar (AAR-2026-001)**.
   - View the **Longitudinal Vitals Chart** showing how his blood pressure has climbed from 130 to 150 mmHg over 6 months across 3 camps.
3. **Smart Rx Writepad & Voice Dictation:**
   - Click **"Record New Visit"** on any patient.
   - Try the **Smart Rx Writepad** tab: click a quick test scenario chip (e.g. *Skin / Hairfall Case* or *Acute Fever*), or click **"Dictate Note (Mic)"** to speak symptoms naturally.
   - Watch the **Live Extracted Clinical Passport** parse raw symptoms and medications in real-time.
4. **Print Clinical Rx Slip (100% Offline):**
   - Switch to the **"Consultation History"** tab.
   - Click **"Print Rx Slip"** on any recorded visit to preview the printable prescription slip ready for paper dispensing in rural camps.
5. **Trigger Google Gemini Clinical Review:**
   - Click the **"Clinical AI Review"** tab.
   - Click **"Generate Longitudinal Summary"** (calls Google Gemini 1.5).
   - Experience the shimmering **AI Synthesis Skeleton Screen** while Gemini analyzes multi-visit trajectories, flags missing lab adherence tests, and presents an assistive draft for clinician sign-off.
6. **The Hero Offline Demonstration:**
   - Open Chrome DevTools → Network → select **"Offline"** (or turn off Wi-Fi).
   - Notice the top navbar immediately turns amber: **"Offline Mode (Local Dexie)"**.
   - Record a new visit; it saves instantly to IndexedDB with a **"1 Pending Sync"** badge.
7. **Seamless Reconnection & Sync:**
   - Switch DevTools Network back to **"Online"**.
   - Auto-sync triggers (or click **"Sync Now"**): the badge turns green, writes to Neon PostgreSQL, and updates the longitudinal trajectory in real-time!

---

## 🛡️ Safety & Data Ethics
- **Synthetic Data Only:** All records, patient names, and dates are strictly fictional for hackathon development and testing.
- **Clinician-in-the-Loop:** AI acts strictly as an assistive summarizer; every AI output requires review and cannot overwrite clinical records.
- **Idempotency Protection:** Offline sync uses client-side UUIDs to guarantee zero duplicate submissions.

---
*Built with ❤️ for Hacktoberfest Bhopal 2026.*

