# TripXora

TripXora is an AI-powered dynamic travel planning platform. It allows users to create customized itineraries, calculate precise budgets, and dynamically replan routes using natural language.

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS v4, React Router
**Backend:** Node.js, Express, MongoDB, Mongoose
**AI Integration:** Google Gemini 2.5 Pro (via @google/genai)
**Maps Integration:** Google Maps JavaScript API (Places, Routes)

## Core Features
1. **AI Itinerary Generation:** Generates comprehensive day-by-day travel plans using Gemini, strictly adhering to JSON schemas.
2. **Budget Optimization:** Calculates estimated trip costs and allows users to simulate budget increases or ask the AI for cheaper alternatives.
3. **Dynamic Replanning:** Adjust an existing itinerary via a text prompt (e.g., "I want more time at the museum" or "Remove the expensive dinner"), and the AI will logically patch time gaps and adjust the route.
4. **Smart Packing List:** AI-generated segmented packing checklist based on destination, trip duration, and user interests.
5. **Interactive Map & Discovery:** View places on Google Maps, discover top attractions, and add them seamlessly to the trip.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Google Maps API Key
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```
Start the frontend dev server:
```bash
npm run dev
```

## Architecture
- **Auth Flow:** JWT tokens are stored in `localStorage` and attached to outgoing requests via Axios interceptors.
- **State Management:** Uses React Context API (`AuthContext`, `TripContext`) for global state.
- **AI Structured Output:** The backend communicates with Gemini 2.5 Pro using strict JSON schemas defined in `backend/src/services/ai/schemas/` to ensure the AI's output is consistently parseable.
