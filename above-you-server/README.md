# 🔢 Above You — Backend

## 🌐 Overview
A lightweight Express.js backend that serves as a secure proxy layer for geospatial and astronomy APIs, with built-in user authentication, database integration, and access control.

## 🏗️ Tech Stack
- **Node.js + Express.js** — REST API framework
- **PostgreSQL (via Supabase)** — For storing user data
- **Axios** — HTTP client for calling external APIs
- **JWT** — Authentication and session handling
- **CORS** — Cross-origin domain control
- **Rate Limiting** — Basic abuse prevention middleware

## ⚙️ Core Features (+ Progress)
- [✔️] **Reverse Geocoding Proxy (OSM)** — Fetch human-readable location from GPS
- [✔️] **ISS Location API** — Real-time coordinates of the ISS
- [✔️] **Weather + Celestial Data** — Proxy layer for Open-Meteo & AstronomyAPI
- [✔️] **CORS Config via .env** — Restrict access to allowed domains
- [✔️] **JWT Auth Middleware** — Protect private routes using Bearer tokens
- [✔️] **PostgreSQL Database (Supabase)** — For storing and managing user data
- [✔️] **Auth Endpoints (Register/Login)** — /api/auth/login, /api/auth/register
- [✔️] **Delete Account (Protected)** — /api/protected/delete, requires token

## 🔜 Upcoming Features
- [🚧] Save user preferences (location, units, etc.)

## 🔧 Available Endpoints

### 🌍 Public Routes
| Method | Endpoint                                    | Description |
|--------|---------------------------------------------|-------------|
| GET    | `/api/reverse-geocode?lat=...&lon=...`      | Convert GPS to human-readable location |
| GET    | `/api/iss-flyover`                          | Return real-time ISS coordinates |
| GET    | `/api/weather?lat=...&lon=...`              | Fetch weather data from Open-Meteo |
| GET    | `/api/celestial?lat=...&lon=...`            | Fetch celestial visibility from AstronomyAPI |

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|------------------------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and return JWT |
| DELETE | `/api/protected/delete` | Delete the currently authenticated user |