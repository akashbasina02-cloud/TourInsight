<p align="center">
  <img src="icoin/icon.png" width="280" alt="TourInsight Logo">
</p>
# TourInsight — Smart, Safe & Personalized Travel Companion

TourInsight is a full-stack travel-planning prototype built with React, Vite, Tailwind CSS, MapLibre, OpenStreetMap services, a lightweight Node/Express backend, and an optional Gemini-powered travel assistant.

## What is included

- Interactive world explorer with country selection.
- Personalized trip planner with origin, destination, date, days, travellers, transport, interests, pace, hotel preference, budget, women/girls travelling context, and optional guide estimate.
- Deterministic day-wise itinerary generation.
- Planning-budget breakdown in INR.
- MapLibre trip map with numbered stops and OSRM driving routes, with straight-line fallback.
- Nearby essentials from OpenStreetMap Overpass with local caching.
- Weather snapshot via Open-Meteo.
- Guide discovery, selection, reviews, and rating recalculation.
- Safety overview and India emergency contacts.
- Online trip assistant with optional Gemini integration and Confirm/Cancel itinerary edits.
- Offline trip pack: local snapshot + downloadable standalone HTML containing itinerary, route snapshot, images where available, budget, weather snapshot, emergency contacts, and a rule-based offline assistant.
- Calendar `.ics` export.
- Private dashboard for saved trips.
- Email/password auth, email OTP verification, password reset, and optional Google sign-in.
- Wikipedia/Wikimedia destination image lookup with server and device caching.

## Project structure

```text
TourInsight/
├── backend/
│   ├── data/                 # runtime JSON store (gitignored)
│   ├── functions/            # AI assistant + destination image lookup
│   ├── lib/                  # auth, entity rules, mail, persistence
│   ├── schemas/              # vendor-neutral entity schema reference
│   └── server.js             # Express API + production static server
├── public/
├── src/
│   ├── api/appClient.js
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```
# 🌍 TourInsight
## Smart, Safe & Personalized Travel Companion

**Plan Smart • Travel Safe • Explore More**

TourInsight is an intelligent travel platform that combines
personalized itinerary planning, budget estimation, interactive maps,
weather, safety tools, nearby essentials, local guides, AI assistance,
and offline trip support in one platform.

### Smart India Hackathon

- Problem Statement ID: SIH26204
- Theme: Travel & Tourism
- Category: Software
- Team ID: 130384

### Future Scope

- Flight, train and bus booking
- Hotel and attraction ticket booking
- Secure payment integration
- Blockchain-based ticket verification
- Tamper-resistant booking records
- Live SOS sharing
- Multilingual voice assistant
- Advanced offline maps

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Set a strong `JWT_SECRET`.
4. Run:

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:8787`. Vite proxies `/api` requests to the backend automatically.

## Authentication in local development

Email registration uses a 6-digit OTP. When SMTP variables are not configured, the OTP and password-reset link are printed in the backend terminal so the full flow can still be tested locally.

To enable email delivery, fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM`.

Google sign-in is optional. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a callback URL matching your Google OAuth application settings.

## Gemini assistant

Set:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

If no Gemini key is configured, the application still works. The assistant falls back to deterministic rule-based answers and itinerary change proposals.

## Build and run for production

```bash
npm run build
npm start
```

When `dist/` exists, the Express server serves the built React application and the API from one process.

## Data storage

This repository intentionally uses a simple JSON data store under `backend/data/database.json` so the prototype is self-contained and easy to run. The file is created automatically and is gitignored.

For a production deployment, replace this store with PostgreSQL, MySQL, SQLite, MongoDB, or another durable database and add production-grade rate limiting, audit logging, secret management, backups, and stronger session/CSRF protections.

## External data/services

TourInsight uses public services where appropriate:

- OpenFreeMap / MapLibre for interactive maps.
- OSRM for driving-route geometry.
- OpenStreetMap Overpass for nearby essentials.
- OpenStreetMap Nominatim for stop geocoding.
- Open-Meteo for destination geocoding and forecast snapshots.
- Wikipedia/Wikimedia for destination images.

These services can have usage policies and rate limits. For production traffic, review each provider's terms and consider hosted or self-hosted alternatives.

## Important product labels

The app distinguishes planning data from live data. Budget values are estimates, cached nearby results are marked as saved snapshots, and the offline assistant only answers from saved trip data. Offline route maps in the downloadable pack are saved SVG snapshots; they are not live interactive map tiles.
