const domain = localStorage.getItem("selectedDomain");
const searchedPlace = localStorage.getItem("searchedPlace");

document.getElementById("title").innerText =
  `Crime Hotspots for Domain: ${domain}`;

const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Disable default zoom on double click
map.doubleClickZoom.disable();

Promise.all([
  fetch("data/world.geo.json").then(res => res.json()),
  loadHistoricData(),
  loadRealtimeData()
]).then(([geoData, historicData, realtimeData]) => {

  const combinedData = [...historicData, ...realtimeData];

  /* ---------- DATA PREP ---------- */
  const filteredHistoric = filterByDomain(historicData, domain);
  const filteredRealtime = filterByDomain(realtimeData, domain);
  const filteredCombined = filterByDomain(combinedData, domain);

  createCountryMarkers(filteredCombined);
  addCountryMarkers(filteredCombined);

  const crimeCount = countCrimesByCountry(filteredCombined);
  populateTable(crimeCount);

  /* ---------- SEARCH HANDLING ---------- */
  if (searchedPlace) {
    geoData.features.forEach(feature => {
      const name = feature.properties.name;

      if (name.toLowerCase().includes(searchedPlace.toLowerCase())) {
        const bounds = L.geoJson(feature).getBounds();
        map.fitBounds(bounds);

        L.geoJson(feature, {
          style: {
            color: "#000",
            weight: 3,
            fillOpacity: 0.4
          }
        }).addTo(map);
      }
    });
  }

  /* ---------- STYLE ---------- */
  function getCountryStyle(countryName) {
    const value = crimeCount[countryName] || 0;
    return {
      fillColor: value > 0 ? "#e63946" : "#e0e0e0",
      weight: 1,
      opacity: 1,
      color: "#555",
      fillOpacity: 0.7
    };
  }

  /* ---------- MAP EVENTS ---------- */
  function onEachFeature(feature, layer) {
    const country = feature.properties.name;
    const total = crimeCount[country] || 0;

    layer.setStyle(getCountryStyle(country));

    layer.on("mouseover", function () {
      layer.setStyle({ weight: 2, fillOpacity: 0.9 });
      layer.bindTooltip(
        `<b>${country}</b><br>Total Crimes: ${total}`,
        { sticky: true }
      ).openTooltip();
    });

    layer.on("mouseout", function () {
      layer.setStyle(getCountryStyle(country));
      layer.closeTooltip();
    });

    layer.on({
      click: function () {

        const historic = analyzeCountryData(filteredHistoric, country);
        const realtime = analyzeCountryData(filteredRealtime, country);

        const overallTotal = historic.total + realtime.total;
        const overallSolved = historic.solved + realtime.solved;
        const overallUnsolved = historic.notSolved + realtime.notSolved;

        const overallPercent = overallTotal > 0
          ? ((overallSolved / overallTotal) * 100).toFixed(2)
          : 0;

        /* ---------- HISTORIC BOX ---------- */
        document.getElementById("historicTotal").innerText = historic.total;
        document.getElementById("historicSolved").innerText = historic.solved;
        document.getElementById("historicUnsolved").innerText = historic.notSolved;
        document.getElementById("historicPercent").innerText = historic.solvedPercentage;

        /* ---------- REALTIME BOX ---------- */
        const realtimeBox = document.querySelector(".analysis-box.realtime");

        if (realtimeBox) {
          const values = realtimeBox.querySelectorAll("p");

          if (values.length >= 4) {
            values[0].innerText = `Total Crimes: ${realtime.total}`;
            values[1].innerText = `Solved: ${realtime.solved}`;
            values[2].innerText = `Not Solved: ${realtime.notSolved}`;
            values[3].innerText = `Solved %: ${realtime.solvedPercentage}%`;
          }
        }

        /* ---------- OVERALL BOX ---------- */
        document.getElementById("overallTotal").innerText = overallTotal;
        document.getElementById("overallSolved").innerText = overallSolved;
        document.getElementById("overallUnsolved").innerText = overallUnsolved;
        document.getElementById("overallPercent").innerText = overallPercent;
      },

      dblclick: function () {
        localStorage.setItem("selectedCountry", country);
        window.open("country.html", "_blank");
      }
    });
  }

  /* ---------- RANKING TABLE ---------- */
  function populateTable(crimeCount) {
    const tbody = document.querySelector("#crimeTable tbody");
    tbody.innerHTML = "";

    Object.entries(crimeCount)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${country}</td><td>${count}</td>`;
        tbody.appendChild(row);
      });
  }

  /* ---------- ADD GEOJSON ---------- */
  L.geoJson(geoData, {
    onEachFeature: onEachFeature
  }).addTo(map);

});

/* ---------- COUNTRY CIRCLE MARKERS ---------- */
function addCountryMarkers(data) {
  const countryPoints = {};

  data.forEach(d => {
    if (!d.country || !d.latitude || !d.longitude) return;

    const country = normalizeCountry(d.country);

    if (!countryPoints[country]) {
      countryPoints[country] = { latSum: 0, lonSum: 0, count: 0 };
    }

    countryPoints[country].latSum += Number(d.latitude);
    countryPoints[country].lonSum += Number(d.longitude);
    countryPoints[country].count += 1;
  });

  Object.entries(countryPoints).forEach(([country, val]) => {
    const lat = val.latSum / val.count;
    const lon = val.lonSum / val.count;

    L.circleMarker([lat, lon], {
      radius: 6,
      fillColor: "#1d3557",
      color: "#fff",
      weight: 1,
      fillOpacity: 0.9
    })
    .bindTooltip(`<b>${country}</b>`, { direction: "top" })
    .addTo(map);
  });
}

/* ---------- ICON MARKERS ---------- */
const locationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

function createCountryMarkers(data) {
  const countryMap = {};

  data.forEach(d => {
    if (!d.country || !d.latitude || !d.longitude) return;

    const country = normalizeCountry(d.country);

    if (!countryMap[country]) {
      countryMap[country] = { latSum: 0, lonSum: 0, count: 0 };
    }

    countryMap[country].latSum += Number(d.latitude);
    countryMap[country].lonSum += Number(d.longitude);
    countryMap[country].count++;
  });

  Object.entries(countryMap).forEach(([country, obj]) => {
    if (obj.count === 0) return;

    const lat = obj.latSum / obj.count;
    const lon = obj.lonSum / obj.count;

    const marker = L.marker([lat, lon], { icon: locationIcon })
      .addTo(map);

    marker.bindTooltip(
      `<b>${country}</b><br>Data Available`,
      { direction: "top" }
    );

    marker.on("click", () => {
      localStorage.setItem("selectedPlace", country);
      localStorage.setItem("placeType", "country");
      window.open("place.html", "_blank");
    });
  });
}
