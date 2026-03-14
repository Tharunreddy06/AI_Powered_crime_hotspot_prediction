const country = localStorage.getItem("selectedCountry");
document.getElementById("countryTitle").innerText = country;

/* ---------- MAP ---------- */
const map = L.map("countryMap").setView([22.5, 78.9], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ---------- LOCATION ICON ---------- */
const locationIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

/* ---------- STATE NAME EXTRACTOR ---------- */
function getStateName(feature, country) {
  if (country === "India") {
    return feature.properties.ST_NM || feature.properties.NAME_1;
  }
  if (country === "Australia") {
    return feature.properties.STATE_NAME || feature.properties.name;
  }
  if (country === "Canada") {
    return feature.properties.name;
  }
  return feature.properties.name || feature.properties.NAME_1;
}

/* ---------- LOAD GEOJSON + DATA ---------- */
const geoFile = `data/${country.toLowerCase().replace(/\s+/g, "")}geo.json`;

Promise.all([
  fetch(geoFile).then(res => {
    if (!res.ok) throw new Error("GeoJSON not found");
    return res.json();
  }).catch(() => {
    alert(`GeoJSON for ${country} not found: ${geoFile}`);
    return null;
  }),
  loadHistoricData(),
  loadRealtimeData()
]).then(([stateGeo, historicData, realtimeData]) => {

  if (!stateGeo) return;

  const historicCountry = filterByCountry(historicData, country);
  const realtimeCountry = filterByCountry(realtimeData, country);
  const combinedCountry = [...historicCountry, ...realtimeCountry];

  const stateCount = countCrimesByState(combinedCountry, country);

  populateStateTable(stateCount);

  function styleState(state) {
    return {
      fillColor: (stateCount[state] || 0) > 0 ? "#ff6b6b" : "#e0e0e0",
      weight: 1,
      color: "#333",
      fillOpacity: 0.7
    };
  }

  function onEachState(feature, layer) {
    const rawState = getStateName(feature, country);
    const state = normalizeState(rawState, country);

    const total = stateCount[state] || 0;
    layer.setStyle(styleState(state));

    layer.on("mouseover", () => {
      layer.bindTooltip(
        `<b>${state}</b><br>Total Crimes: ${total}`,
        { sticky: true }
      ).openTooltip();
    });

    layer.on("mouseout", () => layer.closeTooltip());

    layer.on("click", () => {
      const historic = analyzeStateData(historicCountry, state, country);
      const realtime = analyzeStateData(realtimeCountry, state, country);

      const overallTotal = historic.total + realtime.total;
      const overallSolved = historic.solved + realtime.solved;

      const overallPercent = overallTotal > 0
        ? ((overallSolved / overallTotal) * 100).toFixed(2)
        : 0;

      localStorage.setItem("selectedState", state);

      /* ---------- HISTORIC ---------- */
      document.getElementById("h_total").innerText = historic.total;
      document.getElementById("h_solved").innerText = historic.solved;
      document.getElementById("h_unsolved").innerText = historic.notSolved;
      document.getElementById("h_percent").innerText = historic.solvedPercentage;

      /* ---------- REALTIME ---------- */
      document.getElementById("r_total").innerText = realtime.total;
      document.getElementById("r_solved").innerText = realtime.solved;
      document.getElementById("r_unsolved").innerText = realtime.notSolved;
      document.getElementById("r_percent").innerText = realtime.solvedPercentage;

      /* ---------- OVERALL ---------- */
      document.getElementById("o_total").innerText = overallTotal;
      document.getElementById("o_percent").innerText = overallPercent;
    });
  }

  const geoLayer = L.geoJson(stateGeo, {
    onEachFeature: onEachState
  }).addTo(map);

  try {
    map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
  } catch (e) {
    console.warn("Could not auto-center map:", e);
  }

  /* ---------- LOAD HOTSPOTS ---------- */
  loadHotspots(country);

  /* ---------- ADD MARKERS ---------- */
  addStateMarkers(combinedCountry, country);

});

/* ---------- STATE MARKERS ---------- */
function addStateMarkers(data, countryName) {
  const stateMap = {};

  data.forEach(d => {
    if (normalizeCountry(d.country) !== countryName) return;
    if (!d.latitude || !d.longitude) return;

    const state = normalizeState(d.state, countryName);

    if (!stateMap[state]) {
      stateMap[state] = { latSum: 0, lonSum: 0, count: 0 };
    }

    stateMap[state].latSum += Number(d.latitude);
    stateMap[state].lonSum += Number(d.longitude);
    stateMap[state].count += 1;
  });

  Object.entries(stateMap).forEach(([state, obj]) => {
    if (obj.count === 0) return;

    const lat = obj.latSum / obj.count;
    const lon = obj.lonSum / obj.count;

    const marker = L.marker([lat, lon], { icon: locationIcon }).addTo(map);

    marker.bindTooltip(
      `<b>${state}</b><br>Click for analysis`,
      { direction: "top" }
    );

    marker.on("click", () => {
      localStorage.setItem("selectedPlace", JSON.stringify({
        country: countryName,
        state: state
      }));
      window.location.href = "place.html";
    });
  });
}

/* ---------- TABLE ---------- */
function populateStateTable(stateCount) {
  const tbody = document.querySelector("#stateTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  Object.entries(stateCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${state}</td><td>${count}</td>`;
      tbody.appendChild(tr);
    });
}

/* ---------- HOTSPOTS ---------- */

function loadHotspots(country) {
  const box = document.getElementById("hotspotList");

  box.innerHTML = "Loading...";

  fetch(`http://127.0.0.1:5000/hotspots/${country}`)
    .then(res => res.json())
    .then(data => {

      if (!data || data.length === 0) {
        box.innerHTML = "No hotspot data available";
        return;
      }

      let html = "<ol>";

      data.forEach(item => {
        html += `<li>${item.state} - ${item.score}%</li>`;
      });

      html += "</ol>";

      box.innerHTML = html;
    })
    .catch(err => {
      console.error("Hotspot error:", err);
      box.innerHTML = "Backend not running";
    });
}
