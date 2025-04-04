# 🎨 Above You — Frontend

## 🌌 Overview
A minimal yet interactive frontend offering a smooth, responsive user experience.

## 🏗️ Tech Stack
- **Vue.js** — Reactive UI framework
- **Leaflet** — Interactive map rendering
- **TailwindCSS** — Utility-first styling

## ⚙️ Core Features (+ Progress)
- [✔️] **UI Layout** — Header, dashboard, reusable component system
- [✔️] **Live Map Tracking** — User geolocation with Leaflet + OpenStreetMap
- [✔️] **Real-Time ISS Tracking** — Live position & distance to International Space Station
- [✔️] **Weather & Celestial Integration** — Astronomy + Open-Meteo APIs
- [✔️] **Performance Optimization** — Efficient polling & smart thresholds
- [🚧] **Refined UX** — Loading indicators, animations, transitions
- [   ] **Local Storage Caching** — Save user location & reduce requests

## 🔜 Upcoming Features
- [   ] **User Authentication** — Login & preferences
- [   ] **Custom Location Search** — View sky anywhere in the world
- [   ] **Dark Mode Support**

## 🗺️ Geolocation & Mapping
- Uses `navigator.geolocation.watchPosition()`
- Backend proxy for reverse geocoding (OSM)
- Haversine-based distance calculation