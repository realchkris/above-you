# 🎨 Above You — Frontend

## 🌌 Overview
A minimal yet interactive frontend for real-time sky tracking, ISS positioning, and astronomical data. Optimized for mobile and built with Vue 3 + TailwindCSS.

## 🏗️ Tech Stack
- **Vue.js 3 + Composition API** — Reactive UI framework
- **Pinia + pinia-plugin-persistedstate** — State management & persistence
- **TailwindCSS** — Utility-first styling
- **Leaflet.js** — Lightweight map renderer
- **Vue Lucide** — Icon system
- **Vite** — Build tool

## ⚙️ Core Features (+ Progress)
- [✔️] **UI Layout System** — Header, Sidebar, Skeletons, Wrappers
- [✔️] **Live Geolocation** — Auto-tracking via watchPosition()
- [✔️] **ISS Tracking** — Real-time ISS data with distance calc
- [✔️] **Weather & Celestial Integration** — AstronomyAPI + Open-Meteo
- [✔️] **Reusable UI Components** — Confirmation modals, skeleton loaders
- [✔️] **Smart Polling & Thresholds** — Prevents unnecessary updates
- [✔️] **Reverse Geocoding** — Human-readable address from GPS
- [✔️] **User Authentication** — Login, registration, logout
- [✔️] **Account Deletion** — Via modal confirmation & API
- [✔️] **Error & Success Toasts** — Global UI store with reactive feedback
- [✔️] **Loading States** — Per-module tracking with ui.setLoading()
- [✔️] **Responsive Layout** — Fully mobile-optimized

## 🔜 Upcoming Features
- [🚧] **Custom Location Search** — View sky anywhere in the world

## 🗺️ Geolocation & Mapping
- Uses `navigator.geolocation.watchPosition()`
- Backend proxy for reverse geocoding (OSM)
- Haversine-based distance calculation