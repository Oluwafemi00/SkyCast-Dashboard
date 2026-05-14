// ============================================================
//  SKYCAST PREMIUM — Weather Dashboard
//  script.js
// ============================================================

const API_KEY = "2cab751e458687f1635af427a067aa87";

// ─── STATE ───────────────────────────────────────────────────
let currentUnit = "metric"; // "metric" | "imperial"
let lastQuery = "";
let lastWeather = null;

// ─── DOM ─────────────────────────────────────────────────────
const mainArea = document.getElementById("mainArea");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggle = document.getElementById("unitToggle");
const locateBtn = document.getElementById("locateBtn");
const toastEl = document.getElementById("toast");
const bgGlow = document.querySelector(".bg-glow");

// ─── TOAST ───────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "") {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = "toast" + (type ? " " + type : "") + " show";
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
}

// ─── UNIT TOGGLE ─────────────────────────────────────────────
unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  updateUnitButtonLabel();
  if (lastQuery) fetchWeather(lastQuery);
});

function updateUnitButtonLabel() {
  if (currentUnit === "metric") {
    unitToggle.innerHTML = "<strong>°C</strong> · °F";
  } else {
    unitToggle.innerHTML = "°C · <strong>°F</strong>";
  }
}
updateUnitButtonLabel();

// ─── SEARCH ──────────────────────────────────────────────────
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showToast("Please enter a city name.", "error");
    return;
  }
  fetchWeather(`q=${encodeURIComponent(city)}`);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// ─── GEOLOCATION ─────────────────────────────────────────────
locateBtn.addEventListener("click", getLocation);

function getLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation not supported.", "error");
    return;
  }
  showLoading("Locating you…");
  navigator.geolocation.getCurrentPosition(
    (pos) =>
      fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
    () => {
      showError("Location access denied. Please search manually.");
    },
  );
}

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    showLoading("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
      () => showDefault(),
    );
  }
});

// ─── FETCH ───────────────────────────────────────────────────
async function fetchWeather(query) {
  lastQuery = query;
  showLoading();

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?${query}&units=${currentUnit}&appid=${API_KEY}`,
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?${query}&units=${currentUnit}&appid=${API_KEY}`,
      ),
    ]);

    if (!weatherRes.ok) {
      const err = await weatherRes.json();
      throw new Error(err.message || "City not found.");
    }

    const [weather, forecast] = await Promise.all([
      weatherRes.json(),
      forecastRes.json(),
    ]);

    lastWeather = weather;
    applyTheme(weather.weather[0].id, isDaytime(weather));
    renderAll(weather, forecast);
  } catch (err) {
    showError(err.message);
  }
}

// ─── THEME ENGINE ────────────────────────────────────────────
function applyTheme(conditionId, daytime) {
  const body = document.body;
  body.classList.remove(
    "sky-clear",
    "sky-sunny",
    "sky-cloudy",
    "sky-rainy",
    "sky-stormy",
    "sky-snowy",
    "sky-foggy",
    "sky-default",
  );

  let theme = "sky-default";
  if (conditionId >= 200 && conditionId < 300) theme = "sky-stormy";
  else if (conditionId >= 300 && conditionId < 600) theme = "sky-rainy";
  else if (conditionId >= 600 && conditionId < 700) theme = "sky-snowy";
  else if (conditionId >= 700 && conditionId < 800) theme = "sky-foggy";
  else if (conditionId === 800) theme = daytime ? "sky-sunny" : "sky-clear";
  else if (conditionId > 800)
    theme = conditionId <= 802 ? "sky-cloudy" : "sky-cloudy";

  body.classList.add(theme);

  // Update glow layer colours dynamically from CSS vars
  requestAnimationFrame(() => {
    const glow = getComputedStyle(body).getPropertyValue("--glow").trim();
    bgGlow.style.background = `
      radial-gradient(ellipse 70% 50% at 60% 20%, ${hexToRgba(glow, 0.14)} 0%, transparent 65%),
      radial-gradient(ellipse 40% 30% at 20% 70%, ${hexToRgba(glow, 0.07)} 0%, transparent 60%)
    `;
  });

  // Update search button colour
  requestAnimationFrame(() => {
    const glow = getComputedStyle(body).getPropertyValue("--glow").trim();
    searchBtn.style.background = glow;
  });

  // Spawn particles
  spawnParticles(conditionId);
}

function hexToRgba(hex, alpha) {
  hex = hex.replace(/^\s*#|\s*$/g, "");
  if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isDaytime(weatherData) {
  const now = weatherData.dt + weatherData.timezone;
  const rise = weatherData.sys.sunrise + weatherData.timezone;
  const set = weatherData.sys.sunset + weatherData.timezone;
  return now >= rise && now <= set;
}

// ─── PARTICLES ───────────────────────────────────────────────
let particleInterval = null;

function spawnParticles(conditionId) {
  const container = document.getElementById("particles");
  container.innerHTML = "";
  clearInterval(particleInterval);

  // Rain
  if (conditionId >= 300 && conditionId < 600) {
    particleInterval = setInterval(() => {
      const p = document.createElement("div");
      p.className = "particle";
      const x = Math.random() * 100;
      p.style.cssText = `
        left:${x}%;bottom:-5px;
        width:1px;height:${8 + Math.random() * 12}px;
        background:rgba(120,180,255,0.4);
        border-radius:1px;
        animation-duration:${0.6 + Math.random() * 0.8}s;
        animation-delay:${Math.random() * 0.5}s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }, 60);
  }

  // Snow
  if (conditionId >= 600 && conditionId < 700) {
    particleInterval = setInterval(() => {
      const p = document.createElement("div");
      p.className = "particle";
      const x = Math.random() * 100;
      const size = 2 + Math.random() * 4;
      p.style.cssText = `
        left:${x}%;bottom:-5px;
        width:${size}px;height:${size}px;
        background:rgba(200,230,255,0.7);
        animation-duration:${3 + Math.random() * 4}s;
        animation-delay:${Math.random()}s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, 150);
  }

  // Stars for clear night
  if (conditionId === 800) {
    for (let i = 0; i < 50; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = 1 + Math.random() * 2;
      p.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 60}%;
        width:${size}px;height:${size}px;
        background:rgba(255,255,255,0.8);
        animation-duration:${3 + Math.random() * 5}s;
        animation-delay:${Math.random() * 5}s;
        animation-name:starTwinkle;
      `;
      container.appendChild(p);
    }
    // inject star animation if not present
    if (!document.getElementById("star-style")) {
      const s = document.createElement("style");
      s.id = "star-style";
      s.textContent = `@keyframes starTwinkle{0%,100%{opacity:0.2}50%{opacity:0.9}}`;
      document.head.appendChild(s);
    }
  }
}

// ─── RENDER ──────────────────────────────────────────────────
function renderAll(weather, forecast) {
  const u = currentUnit === "metric" ? "°C" : "°F";
  const speed = currentUnit === "metric" ? "m/s" : "mph";
  const { name, sys, main, weather: cond, wind, visibility, clouds } = weather;

  // Build daily forecast from 3-hour list (midday snapshots)
  const daily = buildDailyForecast(forecast.list);

  mainArea.innerHTML = `
    <div class="weather-wrap">

      <!-- HERO -->
      <div class="weather-hero">
        <div class="hero-left">
          <div class="city-name">${escHtml(name)}</div>
          <div class="city-country">${escHtml(sys.country || "")} · ${localTime(weather)}</div>
          <div class="temp-main">
            ${Math.round(main.temp)}<span class="temp-unit-sup">${u}</span>
          </div>
          <div class="weather-desc">${cond[0].description}</div>
        </div>
        <div class="hero-right">
          <span class="weather-emoji">${conditionEmoji(cond[0].id, isDaytime(weather))}</span>
          <div class="feels-like">Feels like <strong>${Math.round(main.feels_like)}${u}</strong></div>
          <div class="feels-like">Humidity <strong>${main.humidity}%</strong></div>
          <span class="weather-condition-tag">${cond[0].main}</span>
        </div>
      </div>

      <!-- STAT CARDS -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-card-label">Wind</div>
          <div class="stat-card-value">${Math.round(wind.speed)}</div>
          <div class="stat-card-unit">${speed}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Pressure</div>
          <div class="stat-card-value">${main.pressure}</div>
          <div class="stat-card-unit">hPa</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Visibility</div>
          <div class="stat-card-value">${visibility ? (visibility / 1000).toFixed(1) : "—"}</div>
          <div class="stat-card-unit">km</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Cloud Cover</div>
          <div class="stat-card-value">${clouds ? clouds.all : "—"}</div>
          <div class="stat-card-unit">%</div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- FORECAST -->
      <div class="forecast-section">
        <p class="section-label">5-Day Forecast</p>
        <div class="forecast-grid">
          ${daily
            .map(
              (d) => `
            <div class="forecast-card">
              <div class="forecast-day">${d.day}</div>
              <span class="forecast-icon">${conditionEmoji(d.id, true)}</span>
              <div class="forecast-temp-hi">${Math.round(d.hi)}${u}</div>
              <div class="forecast-temp-lo">${Math.round(d.lo)}${u}</div>
              <div class="forecast-desc">${d.desc}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

    </div>
  `;
}

// ─── DAILY FORECAST BUILDER ──────────────────────────────────
function buildDailyForecast(list) {
  const days = {};
  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString();
    if (!days[key]) {
      days[key] = {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hi: item.main.temp_max,
        lo: item.main.temp_min,
        id: item.weather[0].id,
        desc: item.weather[0].description,
      };
    } else {
      days[key].hi = Math.max(days[key].hi, item.main.temp_max);
      days[key].lo = Math.min(days[key].lo, item.main.temp_min);
    }
  });

  // Skip today, take next 5
  const keys = Object.keys(days);
  const today = new Date().toDateString();
  return keys
    .filter((k) => k !== today)
    .slice(0, 5)
    .map((k) => days[k]);
}

// ─── CONDITION → EMOJI ───────────────────────────────────────
function conditionEmoji(id, daytime = true) {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return id >= 511 ? "🌧️" : "🌧️";
  if (id >= 600 && id < 700) return id === 611 || id === 612 ? "🌨️" : "❄️";
  if (id >= 700 && id < 800) {
    if (id === 781) return "🌪️";
    return "🌫️";
  }
  if (id === 800) return daytime ? "☀️" : "🌙";
  if (id === 801) return daytime ? "🌤️" : "☁️";
  if (id === 802) return "⛅";
  if (id === 803 || id === 804) return "☁️";
  return "🌡️";
}

// ─── LOCAL TIME ──────────────────────────────────────────────
function localTime(weatherData) {
  const utcMs = (weatherData.dt + weatherData.timezone) * 1000;
  const d = new Date(utcMs);
  return d.toUTCString().slice(17, 22); // HH:MM
}

// ─── UI STATES ───────────────────────────────────────────────
function showLoading(label = "Fetching skies…") {
  mainArea.innerHTML = `
    <div class="loading-wrap">
      <div class="loader"></div>
      <p class="loading-label">${label}</p>
    </div>
  `;
}

function showDefault() {
  mainArea.innerHTML = `
    <div class="hero-placeholder">
      <p class="placeholder-text">Search a city or allow location access<br/>to see live weather</p>
    </div>
  `;
}

function showError(msg) {
  mainArea.innerHTML = `
    <div class="error-wrap">
      <span class="error-icon">⚠️</span>
      <p class="error-msg">${escHtml(msg)}</p>
    </div>
  `;
  showToast(msg, "error");
}

// ─── UTILITY ─────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
