# 🎨 Above You — Frontend

## 🌌 Overview
Minimal frontend offering an intuitive and responsive user experience.

## 🏗️ Tech Stack
- **Vue.js** – Reactive UI framework
- **Leaflet** – Interactive maps & geolocation
- **TailwindCSS** – Styling & animations

## ⚙️ Core Features (+ Progress)
- [✔️] **Core UI Layout** – Header, dashboard, and component structure
- [✔️] **Live Map Tracking** – User location via Leaflet + OSM Reverse Geocoding
- [✔️] **Real-Time ISS Tracking** – Fetches ISS location and calculates distance
- [🚧] **Performance Optimization** – Reduce API calls, improve load times
- [🚧] **Refined Error Handling** – Centralized alerts instead of browser popups
- [🚧] **Improved UX/UI** – Better animations, loading indicators
- [   ] **Local Storage Caching** - User location & other data gets saved in localStorage to avoid unnecessary API calls
- [   ] **Weather & Celestial Data** – Integration with external APIs

## 🔜 Upcoming features
- [   ] **Dark Mode Support**
- [   ] **Authentication System** – User can make an account
- [   ] **Custom Location Selection** – Check sky conditions anywhere by saving your favorite locations

## 🗺️ Map & Geolocation Handling
- **Real-time Tracking** – Uses navigator.geolocation.watchPosition()
- **Efficient API Calls** – Backend proxy for OSM Reverse Geocoding
- **Distance Calculation** – Haversine Formula to optimize updates