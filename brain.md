# 🧠 TripXora - Brain & Memory Context File

> **File Purpose:** This file serves as the persistent memory and technical blueprint of the **TripXora** project. It tracks system architecture, core features, database schemas, AI workflows, UI design specifications, and a running change log so any AI or developer session can immediately restore complete context.

---

## 📌 Project Overview
**TripXora** is an AI-powered dynamic travel planning and itinerary management platform. It parses natural language prompts into structured travel parameters, generates day-by-day and itemized hourly schedules, performs real-time place photo/coordinate enrichment, calculates realistic budget breakdowns, supports interactive route mapping with Google Maps, and allows dynamic real-time replanning via natural language commands.

---

## 🏗️ System Architecture & Tech Stack

### 1. Frontend (`/frontend`)
- **Framework & Build Tool:** React 19 + Vite 8
- **Routing:** React Router v7 (`/login`, `/register`, `/dashboard`, `/create`, `/history`, `/profile`)
- **Styling & UI Design:** Tailwind CSS v4 + Framer Motion + Lucide React icons
- **Maps Integration:** `@react-google-maps/api`
- **Global State Management:** React Context API (`AuthContext`, `TripContext`)
- **HTTP Client:** Axios (with request interceptors automatically attaching JWT Bearer tokens)

### 2. Backend (`/backend`)
- **Runtime & Server Framework:** Node.js + Express 5
- **Database & ODM:** MongoDB + Mongoose 9
- **Security & Utilities:** Helmet, CORS, Morgan, Express Validator, Bcrypt, JWT
- **AI Integration:** `@google/genai` SDK v2.16 (Google Gemini 2.5 Pro / Flash) with strict JSON response schemas (`responseSchema`, `responseMimeType: 'application/json'`)
- **Location Services:** Google Maps Places API & Directions API (`@googlemaps/google-maps-services-js`)

---

## ⚙️ Implemented Modules & Features

| Module / Feature | File Locations | Description & Technical Details |
| :--- | :--- | :--- |
| **Auth System** | `backend/src/modules/auth/`<br>`frontend/src/features/auth/` | User registration, login, JWT token generation & verification, password hashing with bcrypt, protected route guards. |
| **Glassmorphism Auth UI** | [Register.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/pages/Register.jsx)<br>[RegisterForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/auth/RegisterForm.jsx)<br>[Login.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/pages/Login.jsx)<br>[LoginForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/auth/LoginForm.jsx) | Full viewport (`100vh`) travel background image (`signup-bg.jpg`), glassmorphism card container (`rgba(255,255,255,0.70)` with `backdrop-filter: blur(10px)`), high-contrast inputs & buttons. |
| **Trip Details Form & Hotel Type** | [TripForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/trip-builder/TripForm.jsx) | Trip creation form supporting origin, destination, dates, travelers, budget, travel mode, age group, interests, and **Hotel Type / Accommodation** dropdown (`5_star`, `4_star`, `3_star`, `2_star`, `budget`, `dharamshala`, `hostel`, `homestay`, `no_preference`). |
| **Trip Model & Schema** | [trip.model.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/trip/trip.model.js) | Mongoose schema supporting user reference, status, parameters, stops, selected places, itinerary days/items, budget breakdown, revision history, and `preferences.hotelType`. |
| **AI Natural Language Parser** | [ai.controller.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/ai/ai.controller.js) (`parseTripInput`) | Parses unstructured raw text prompts into structured JSON fields (origin, destination, dates, travelers, budget, travel mode, interests, age group, hotel type) using [tripParse.schema.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/services/ai/schemas/tripParse.schema.js). |
| **AI Itinerary Generator** | [ai.controller.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/ai/ai.controller.js) (`generateItinerary`) | Generates structured day-by-day itineraries considering total budget, travel pace, age group, and hotel accommodation preference. Enriches itinerary items with Google Places photo URLs and lat/lng coordinates. |
| **Dynamic AI Replanner** | [ai.controller.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/ai/ai.controller.js) (`replanItinerary`) | Real-time itinerary adjustment engine that processes natural language user prompts (e.g., *"Make day 2 cheaper"* or *"Add Taj Mahal"*), adjusts time gaps, and appends to `trip.revisionHistory`. |
| **Smart AI Packing List** | [ai.controller.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/ai/ai.controller.js) (`generatePackingList`) | Generates destination- and weather-aware categorized packing recommendations adjusted for accommodation type and trip length. |
| **Budget Engine** | [budget.service.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/budget/budget.service.js) | Recalculates estimated costs based on travel mode distance math, stay nights, food, and activities. |
| **Interactive Map & Discovery** | [TripMap.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/map/TripMap.jsx)<br>[Dashboard.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/pages/Dashboard.jsx) | Interactive Google Map rendering origin, destination, route polylines, place search, and location previews. |

---

## 📄 Key File Structure Map

```
TripXora/
├── brain.md                         # Persistent Memory & Context Log
├── backend/
│   ├── server.js                    # HTTP Server Listener
│   └── src/
│       ├── app.js                   # Express Middlewares & Route Mounting
│       ├── config/db.js             # Mongoose MongoDB Connection
│       ├── integrations/googleMaps/ # Places & Directions API Services
│       ├── middlewares/             # authMiddleware & errorHandler
│       ├── modules/
│       │   ├── ai/                  # AI Controller & Routes
│       │   ├── auth/                # Auth Controller, User Model & Routes
│       │   ├── budget/              # Budget Service
│       │   ├── place/               # Google Places API Controllers & Routes
│       │   ├── route/               # Directions API Controller & Routes
│       │   └── trip/                # Trip Mongoose Model, Controller & Routes
│       └── services/ai/             # Gemini Client & Schemas (itinerary.schema.js, tripParse.schema.js)
└── frontend/
    ├── public/
    │   ├── logo.png                 # Main Brand Logo
    │   └── signup-bg.jpg            # Full-Page Travel Background Image Asset
    └── src/
        ├── App.jsx                  # Main Router Setup
        ├── index.css                # Tailwind Theme (--color-primary: #a855f7)
        ├── api/                     # Axios API Services (ai.api.js, auth.api.js, trips.api.js, etc.)
        ├── assets/                  # Local Image Assets (signup-bg.jpg, hero.png)
        ├── contexts/                # AuthContext & TripContext
        ├── features/
        │   ├── auth/                # RegisterForm.jsx & LoginForm.jsx (Glassmorphism UI)
        │   ├── budget/              # BudgetPanel.jsx
        │   ├── extras/              # ExtrasPanel.jsx (Packing List UI)
        │   ├── map/                 # TripMap.jsx
        │   └── trip-builder/        # TripForm.jsx, ItineraryView.jsx, PlaceSearch.jsx, PlacePreview.jsx
        └── pages/                   # Register.jsx, Login.jsx, Dashboard.jsx, CreateTrip.jsx, TripHistory.jsx
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 📋 Change Log & Session History

- **2026-09-01**: Performed comprehensive initial repository analysis and created `brain.md` for persistent session memory.
- **2026-09-01**: Integrated **"Hotel Type / Accommodation"** dropdown field (`hotelType`) into:
  - Frontend form state & UI ([TripForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/trip-builder/TripForm.jsx)) below *Age Group* and above *Interests*.
  - Backend Mongoose model ([trip.model.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/trip/trip.model.js)) `preferences.hotelType`.
  - Gemini AI parsing schema ([tripParse.schema.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/services/ai/schemas/tripParse.schema.js)).
  - AI system prompts in [ai.controller.js](file:///c:/Users/akash/Desktop/TripXora/backend/src/modules/ai/ai.controller.js) for `generateItinerary`, `replanItinerary`, and `generatePackingList`.
- **2026-09-01**: Redesigned **Sign Up** & **Login** authentication pages ([Register.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/pages/Register.jsx), [RegisterForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/auth/RegisterForm.jsx), [Login.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/pages/Login.jsx), [LoginForm.jsx](file:///c:/Users/akash/Desktop/TripXora/frontend/src/features/auth/LoginForm.jsx)):
  - Added full-viewport (`100vh`) cover background image (`signup-bg.jpeg`).
  - Configured premium transparent glassmorphism card (`rgba(255, 255, 255, 0.40)` with `backdrop-filter: blur(12px)` and semi-transparent white inputs `bg-white/60`).
  - Fixed Vite import resolution path to point to `signup-bg.jpeg`.
  - Enhanced contrast and readability for inputs, labels, buttons, and links.
- **2026-09-01**: Updated `brain.md` with complete architectural documentation, feature matrix, file map, and memory log.
