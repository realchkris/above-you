# 🔢 Above You — Backend

## 🌐 Overview
A lightweight **Express.js** backend that serves as a proxy layer for external geospatial and astronomy-related APIs.  
Designed for security, simplicity, and centralized control.

## 🏗️ Tech Stack
- **Node.js + Express.js** — Server runtime and API framework
- **Axios** — For calling external APIs
- **CORS Middleware** — Secure cross-origin handling

## ⚙️ Features & Progress
- [✔️] **Reverse Geocoding Proxy** — OSM integration
- [✔️] **ISS Location API** — Returns current ISS position
- [✔️] **Weather & Celestial Proxy** — Routes to AstronomyAPI + Open-Meteo
- [🚧] **CORS Control via ENV** — Fine-tuned domain restriction
- [   ] **Auth Middleware** — For future user authentication

## 🔧 Available Endpoints
| Method | Endpoint                                    | Description |
|--------|---------------------------------------------|-------------|
| GET    | `/api/reverse-geocode?lat=...&lon=...`      | Convert GPS to human-readable location |
| GET    | `/api/iss-flyover`                          | Return real-time ISS coordinates |
| GET    | `/api/weather?lat=...&lon=...`              | Fetch weather data from Open-Meteo |
| GET    | `/api/celestial?lat=...&lon=...`            | Fetch celestial visibility from AstronomyAPI |

## 🔜 Future
- Add database layer (PostgreSQL)
- Add auth endpoints (register/login)
- Add preference-saving routes for users