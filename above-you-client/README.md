# Above You Frontend

## 🌌 Overview
The frontend is built using Vue 3, Leaflet.js, and TailwindCSS, offering an intuitive and responsive user experience.

## Current Interface Preview  
![Above You Interface](current_interface_preview.png)

## Interface Core Sections (Components)

- **Header/Navbar** – Displays app title and navigation.
- **Main Dashboard** – The primary section showing all real-time data.
    - **Weather Conditions** (temperature, cloud cover, visibility).
    - **Celestial Objects** (retrieved from NASA API).
    - **ISS Flyover Times** (when ISS will be visible).
- **Dark Mode Toggle** – Switch between light and dark themes for better usability.
- **Location Selector** – If users can check sky conditions elsewhere.
- **Login Modal/Popup** – If user authentication is added later.

## 🗺️ Map & Geolocation Handling

- Uses Leaflet.js to display the user’s location.
- Implements OSM Reverse Geocoding through a backend proxy.
- Uses navigator.geolocation.watchPosition() for real-time tracking.
- Frontend caching to reduce API calls, using the Haversine Formula