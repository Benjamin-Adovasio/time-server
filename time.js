let baseTimeMs = null;
let basePerf = 0;
let currentTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Populate timezone selector
function initTZSelector() {
  const select = document.getElementById("tz");

  const zones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo"
  ];

  zones.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    select.appendChild(opt);
  });

  // Restore saved TZ
  const saved = localStorage.getItem("time.tz");
  if (saved && zones.includes(saved)) {
    currentTZ = saved;
  }

  select.value = currentTZ;

  select.addEventListener("change", () => {
    currentTZ = select.value;
    localStorage.setItem("time.tz", currentTZ);
  });
}

// Fetch authoritative time
async function syncTime() {
  try {
    const res = await fetch("/api/time", { cache: "no-store" });
    const data = await res.json();
    baseTimeMs = data.unix * 1000;
    basePerf = performance.now();
  } catch (err) {
    console.error("Time sync failed:", err);
  }
}

// Render loop
function render() {
  if (baseTimeMs === null) {
    requestAnimationFrame(render);
    return;
  }

  const now = baseTimeMs + (performance.now() - basePerf);
  const d = new Date(now);

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: currentTZ,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true
});

const parts = fmt.formatToParts(d);
const hh = parts.find(p => p.type === "hour").value;
const mm = parts.find(p => p.type === "minute").value;
const ss = parts.find(p => p.type === "second").value;
const ap = parts.find(p => p.type === "dayPeriod").value;
const ms = String(d.getMilliseconds()).padStart(3, "0");

document.getElementById("clock").innerHTML =
  `${hh}:${mm}:${ss}<span class="dot">.</span><span class="ms">${ms}</span><span class="ap"> ${ap}</span>`;



  requestAnimationFrame(render);
}

// Init
initTZSelector();
syncTime();
setInterval(syncTime, 10000);
render();
