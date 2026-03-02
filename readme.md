# SkyCast - Weather Dashboard 🌤️

[![Live Demo](https://img.shields.io/badge/Demo-Live_Site-brightgreen.svg)](https://oluwafemi00.github.io/SkyCast-Dashboard/)

## Overview

SkyCast is a responsive, real-time weather dashboard that provides current conditions and a 5-day forecast. Built with a focus on a clean, modern UI and robust error handling, the application dynamically fetches data based on user input or device geolocation.

## Features

- **Real-Time Data:** Fetches current weather metrics (temperature, condition, icons) using the OpenWeatherMap API.
- **5-Day Forecast:** Processes complex JSON arrays to extract and display daily midday forecasts.
- **Geolocation Integration:** Automatically detects and displays weather for the user's local area on page load.
- **Dynamic State Management:** Includes seamless loading spinners, comprehensive error handling for invalid searches, and a metric/imperial unit toggle that updates the UI instantly without page reloads.
- **Clean UI/UX:** Built entirely with custom CSS (Flexbox and CSS variables), implementing a glassmorphism aesthetic without reliance on heavy utility frameworks.

## Technologies Used

- **Frontend:** Semantic HTML5, CSS3 (Flexbox, Custom Properties, Animations)
- **Logic:** Vanilla JavaScript (ES6+)
- **Architecture:** Asynchronous JS (`async/await`, Fetch API), Modular functions
- **External APIs:** OpenWeatherMap REST API, HTML5 Geolocation API

## Engineering Takeaways

Building this project solidified several key technical concepts:

1. **Asynchronous Data Handling:** Managing the "Happy Path" vs. "Error Path" using `try...catch` blocks ensured the application never fails silently, improving the overall user experience.
2. **State Management in Vanilla JS:** Implementing the unit toggle required managing global state (`currentUnit` and `lastQuery`) to re-fetch and re-render data dynamically based on user interaction.
3. **Data Transformation:** The OpenWeatherMap 5-day forecast returns data in 3-hour increments (40 data points). I utilized JavaScript array methods (`.filter()` and `.forEach()`) to isolate the specific timestamps needed for a clean daily view.

## Local Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/oluwafemi00.github.io/SkyCast-Dashboard.git
   \`\`\`
2. Navigate to the project directory:
   \`\`\`bash
   cd weather-dashboard
   \`\`\`
3. Open `index.html` in your browser or run it via a local server (e.g., VS Code Live Server).
   _(Note: You will need to substitute the placeholder API key in `script.js` with your own OpenWeatherMap key for local testing)._
