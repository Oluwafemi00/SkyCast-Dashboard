# SkyCast — Weather Dashboard ⛅

> A cinematic weather app with dynamic sky themes, live exchange rates from OpenWeatherMap, atmospheric particle effects, and a full-bleed design system that responds to actual weather conditions.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![OpenWeatherMap API](https://img.shields.io/badge/API-OpenWeatherMap-orange)

---

## Overview

SkyCast is a weather dashboard that goes beyond displaying temperature. The entire UI — background, accent colour, particle system, and button colour — shifts dynamically based on real weather conditions fetched from the OpenWeatherMap API. Rain makes raindrops fall. Snow triggers snowflakes. Clear nights render twinkling stars.

---

## Features

| Feature                    | Details                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| **Live Weather Data**      | Current conditions from OpenWeatherMap API                           |
| **5-Day Forecast**         | Daily high/low, emoji icon, and description                          |
| **Dynamic Sky Themes**     | 8 themes: Sunny, Clear, Cloudy, Rainy, Stormy, Snowy, Foggy, Default |
| **Particle System**        | Rain, snow, or stars rendered as CSS-animated DOM elements           |
| **°C / °F Toggle**         | Switches units and re-fetches data; active unit bolded               |
| **Geolocation**            | Auto-detects location on load via browser Geolocation API            |
| **Locate Me Button**       | Manual re-trigger of geolocation                                     |
| **Stat Cards**             | Wind speed, pressure, visibility, and cloud cover                    |
| **Local Time Display**     | Shows the city's current local time using UTC offset from API        |
| **Weather Emoji**          | Condition-appropriate emoji mapped from OWM condition codes          |
| **Responsive Layout**      | Adapts cleanly from mobile to desktop                                |
| **Loading / Error States** | Spinner with label; styled error display with toast                  |

---

## Technical Highlights

- **Theme engine** maps OWM condition IDs (e.g. 500–599 = rain) to CSS class names on `<body>`, driving an 8-theme colour system via CSS custom properties
- **Dynamic glow** — after theme switch, JS reads the computed `--glow` CSS variable and injects it as inline `background` on the glow overlay layer, creating a seamless colour transition
- **Particle system** — rain, snow, and stars are DOM elements created and destroyed with `setInterval` + `setTimeout` to avoid memory leaks
- **Forecast builder** — the OWM forecast API returns 3-hour intervals; these are grouped by date to extract daily high/low and modal condition
- **Parallel fetch** — weather and forecast are fetched simultaneously with `Promise.all()` for faster load
- **Cormorant Garamond + Outfit** — luxury serif for the temperature display, clean geometric sans for UI

---

## Project Structure

```
skycast/
├── index.html     ← App shell, search, main content area
├── style.css      ← 8-theme design system, particle animations, responsive layout
└── script.js      ← API calls, theme engine, particle system, forecast builder
```

---

## API Setup

1. Get a free API key at [openweathermap.org](https://openweathermap.org/api)
2. Replace `API_KEY` at the top of `script.js`:
   ```js
   const API_KEY = "your_key_here";
   ```

---

## Design Decisions

- **Full-bleed dark atmosphere** instead of a white card — the background IS the weather
- **1.5s CSS transition** on all theme colour changes — the sky literally shifts when weather changes
- **Search button colour** is dynamically updated to match the current theme's glow — everything coheres

---

## Run Locally

```bash
npx serve skycast/
```

---

## What This Demonstrates

- Integrating a real third-party REST API with error handling and loading states
- Dynamic theming driven by data — not just dark/light but 8 distinct visual contexts
- Particle system design without a physics library
- Parallel async data fetching with `Promise.all()`
