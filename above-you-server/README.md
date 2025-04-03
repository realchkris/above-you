# 🔢 Above You — Backend

## 🌐 Overview
A lightweight **Express.js** backend that serves as a **proxy** for geolocation and space-related API calls.  
It improves **security** and **reduces direct API exposure**.

## 🏗️ Tech Stack
- **Node.js + Express.js** – Fast & minimal server framework  
- **Axios** – HTTP requests to external APIs  
- **CORS Middleware** – Secure cross-origin API handling  

## ⚙️ Core Features & Progress  
- [✔️] **Reverse Geocoding Proxy** – Converts GPS coordinates into readable addresses using OSM  
- [✔️] **ISS Tracking API** – Fetches real-time ISS location & returns coordinates   
- [🚧] **CORS Configuration** – Restrict access via environment variables  
- [✔️] **Weather & Celestial API Proxy** – Fetch astronomical & weather data securely

## 🔜 Upcoming Features    
- [   ] **User Authentication Middleware** – Secure access

## 🔧 API Endpoints  
| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| GET    | `/api/reverse-geocode?lat=...&lon=...` | Fetch location details from OpenStreetMap |
| GET    | `/api/iss-flyover`            | Retrieve real-time ISS position |