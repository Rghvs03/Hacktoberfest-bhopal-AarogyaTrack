# Brag Plan: AarogyaTrack — Every Visit Matters

## What is this app?
An offline-first clinical workspace and longitudinal health monitoring PWA with Google Gemini AI and a physical Smart Rx Writepad engineered for rural medical camps.

## The angle
In rural healthcare camps, zero cell connectivity and lost paper slips break continuity of care. AarogyaTrack solves this with a radical local-first PWA: clinicians record visits in 5 seconds with voice dictation, print A5 prescription slips offline, and when connectivity returns, background sync streams longitudinal trends into Google Gemini for deep trajectory analysis.

## Hook (first 2-3 seconds)
Text: "RURAL HEALTHCARE HAS A CONTINUITY PROBLEM."
Visual: A red/amber flashing "NO SIGNAL (0 BARS)" indicator that instantly switches to a calm, glowing teal badge: "OFFLINE READY • LOCAL DEXIE DB ACTIVE".

## Key moments (the middle)
- **Moment 1: The 5-Second Encounter & Smart Rx Writepad**
  Doctor speaks into the mic ("High fever, headache, BP high, start Dolo 100mg"). Real-time clinical passport extracts symptoms, vitals, and treatment plan without manual data entry.
- **Moment 2: 1-Click Printable Paper Rx Slip**
  Tap "Print Rx Slip" $\rightarrow$ A5 watermarked physical prescription generated instantly on local device with zero internet.
- **Moment 3: Longitudinal Intelligence Powered by Google Gemini**
  Recharts plots multi-camp systolic BP trajectory (130 $\rightarrow$ 148 mmHg). Google Gemini 1.5 detects the rising trajectory, flags missing adherence screenings, and provides an assistive draft for doctor sign-off.
- **Moment 4: Background Idempotent Reconnection**
  Network restored $\rightarrow$ amber "Offline" pill transitions to emerald "All Records Synced" as IndexedDB streams to Neon PostgreSQL.

## Outro / punchline
"Every visit matters. Even when the internet doesn't exist."
Logo & Tagline: **AarogyaTrack** — Built for Hacktoberfest Bhopal.

## User flow worth showing
1. **Entry**: Doctor opens patient Ramesh Kumar (AAR-2026-001) in remote village with zero Wi-Fi.
2. **Action**: Speaks symptoms into Smart Rx Writepad $\rightarrow$ live extraction auto-populates clinical passport $\rightarrow$ prints paper slip.
3. **Result**: Google Gemini detects 6-month hypertensive progression; background sync securely updates Neon PostgreSQL upon camp return.

## Tone
- **Preset**: `polished`
- **Creative direction**: High-craft, purposeful healthcare documentary with rapid, punchy cuts.
- **Interpretation**: Urgent yet deeply calm, high contrast clinical teal and paper tones, zero AI slop, crisp typographic animation.

## Format: landscape — 1920x1080
## Duration: 20 seconds

## Visual identity (from the project)
- Background: `#FBFBFA` (warm clinical paper) & `#0F172A` (clinical deep slate)
- Primary Accent: `#0F766E` (Clinical Teal)
- Highlight Accent: `#CCFBF1` (Mint Glow) & `#F59E0B` (Offline Amber)
- Text: `#0F172A` (deep ink) & `#64748B` (muted slate)
- Display font: `IM Fell English` (authentic serif Rx) & `Inter`
- Body font: `Inter`
- Code / Data font: `monospace / JetBrains Mono`
- Strongest visual element: The Hallmark clinical specimen card, the glowing offline/online sync pill, and the watermarked A5 Rx Slip.

## Storyboard (Beat-by-Beat)

| Beat | Time | Scene | Visual / Animation | Text On Screen | Audio / SFX |
|---|---|---|---|---|---|
| **01** | 0.0s – 3.0s | The Rural Dilemma | Dark slate screen with amber flashing "NO SIGNAL". Sudden snap to teal border. | "ZERO CELL SIGNAL. LOST PAPER SLIPS. BROKEN HEALTHCARE." | Low bass drone, crisp static snap |
| **02** | 3.0s – 6.5s | Meet AarogyaTrack | Fluid zoom into clean, high-craft clinical UI. Amber badge flips to glowing teal: "Offline-First Active". | "AAROGYATRACK — CLINICAL RECORDS THAT WORK ANYWHERE." | Clean digital chime, card slide |
| **03** | 6.5s – 11.0s | Smart Rx Writepad | Microphone pulses green. Doctor's spoken notes stream live onto realistic paper pad. Real-time extraction chips populate. | "SMART RX WRITEPAD. DICTATE IN SECONDS. ZERO BUSYWORK." | Soft mic click, rapid subtle typing taps |
| **04** | 11.0s – 15.0s | Longitudinal Gemini AI | Recharts systolic BP graph curves upward across 3 visits. Google Gemini 1.5 card synthesizes trajectory & flags risks. | "LONGITUDINAL CONTINUITY. POWERED BY GOOGLE GEMINI 1.5." | Smooth riser, harmonic pulse |
| **05** | 15.0s – 18.0s | The Physical Slip & Sync | 1-click A5 printable paper prescription slip slides in. Wi-Fi connects $\rightarrow$ "Sync to Neon Postgres Complete". | "PRINT OFFLINE. AUTO-SYNC WHEN CONNECTED." | Crisp paper whoosh, success confirmation ping |
| **06** | 18.0s – 20.0s | Outro / Call to Action | Minimalist teal & slate lockup with Hacktoberfest badge and GitHub URL. | "AAROGYATRACK: EVERY VISIT MATTERS. GITHUB.COM/RGHVS03" | Warm resolving synth chord |

## Share copy (draft)
"Zero internet in rural health camps? AarogyaTrack brings offline-first clinical records, voice-dictated Smart Rx writepads, and Google Gemini longitudinal trajectory analysis to travelling medical teams. Built for Hacktoberfest Bhopal."

