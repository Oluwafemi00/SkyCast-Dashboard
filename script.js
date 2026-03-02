const apiKey = "2cab751e458687f1635af427a067aa87";
const searchBtn = document.getElementById("searchBtn");
const displayArea = document.getElementById("displayArea");
const forecastArea = document.getElementById("forecastArea");
const unitToggleBtn = document.getElementById("unitToggle"); // New element

// --- NEW: GLOBAL STATE VARIABLES ---
let currentUnit = "metric"; // Default to Celsius
let lastQuery = ""; // Remembers the last location searched

// --- GEOLOCATION (saves the query) ---
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    displayArea.innerHTML = `<p class="loading">Locating you...</p>`;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherData(`lat=${lat}&lon=${lon}`);
      },
      () => {
        displayArea.innerHTML = `<p class="error">Location access denied. Please search.</p>`;
      },
    );
  }
});

// --- TOGGLE BUTTON LOGIC ---
unitToggleBtn.addEventListener("click", () => {
  // 1. Flip the unit state
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";

  // 2. Update the button text
  unitToggleBtn.textContent =
    currentUnit === "metric" ? "Switch to °F" : "Switch to °C";

  // 3. Re-fetch the weather for the last known location using the new unit
  if (lastQuery) {
    fetchWeatherData(lastQuery);
  }
});

// --- FETCH DATA (Now uses currentUnit) ---
async function fetchWeatherData(query) {
  lastQuery = query; // Save the query so the toggle button can use it later
  displayArea.innerHTML = `<p class="loading">Fetching skies...</p>`;
  forecastArea.innerHTML = ``;

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&units=${currentUnit}&appid=${apiKey}`,
    );
    if (!weatherRes.ok) throw new Error("Location not found.");
    const weatherData = await weatherRes.json();
    renderWeather(weatherData);

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${query}&units=${currentUnit}&appid=${apiKey}`,
    );
    if (!forecastRes.ok) throw new Error("Forecast data unavailable.");
    const forecastData = await forecastRes.json();
    renderForecast(forecastData);
  } catch (err) {
    displayArea.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// --- RENDERING (dynamically displays °C or °F) ---
function renderWeather(data) {
  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  const { name, main, weather } = data;
  displayArea.innerHTML = `
        <div class="weather-card">
            <h2>${name}</h2>
            <p class="temp">${Math.round(main.temp)}${unitSymbol}</p>
            <p class="desc">${weather[0].description}</p>
        </div>
    `;
}

function renderForecast(data) {
  const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );
  let forecastHTML = `<div class="forecast-container">`;

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
    });
    forecastHTML += `
            <div class="forecast-item">
                <p class="forecast-date">${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
                <p class="forecast-temp">${Math.round(day.main.temp)}${unitSymbol}</p>
            </div>
        `;
  });

  forecastHTML += `</div>`;
  forecastArea.innerHTML = forecastHTML;
}

// --- SEARCH ---
searchBtn.addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  if (city) fetchWeatherData(`q=${city}`);
});

document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
