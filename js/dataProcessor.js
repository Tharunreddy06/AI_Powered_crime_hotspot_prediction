/* ================= LOAD HISTORIC DATA ================= */
async function loadHistoricData() {
  const res = await fetch("data/final.json");
  return await res.json();
}

/* ================= LOAD REALTIME DATA ================= */
async function loadRealtimeData() {
  try {
    const res = await fetch("data/crime_dataset.json");
    return await res.json();
  } catch (e) {
    console.warn("Realtime dataset not found");
    return [];
  }
}

/* ================= COUNTRY NORMALIZATION ================= */
function normalizeCountry(name) {
  const map = {
    "USA": "United States of America",
    "US": "United States of America",
    "United States": "United States of America",
    "UK": "United Kingdom"
  };
  return map[name] || name;
}

/* ================= STATE NORMALIZATION ================= */
function normalizeState(state, country) {
  if (!state) return state;

  const stateMaps = {
    "Australia": {
      "New South Wales": "NSW",
      "Victoria": "VIC",
      "Queensland": "QLD",
      "Western Australia": "WA",
      "South Australia": "SA"
    },
    "Canada": {
      "Ontario": "Ontario",
      "British Columbia": "British Columbia",
      "Alberta": "Alberta",
      "Quebec": "Quebec",
      "Manitoba": "Manitoba"
    },
    "India": {}
  };

  return stateMaps[country]?.[state] || state;
}

/* ================= DOMAIN FILTER ================= */
function filterByDomain(data, domain) {
  if (domain === "ALL") return data;

  if (domain === "OTHERS") {
    return data.filter(d =>
      !["theft", "cybercrime", "political_related", "sexual_offense", "assault"]
        .includes(d.crime_type)
    );
  }

  return data.filter(d => d.crime_type === domain);
}

/* ================= COUNTRY AGG ================= */
function countCrimesByCountry(data) {
  const out = {};

  data.forEach(d => {
    const c = normalizeCountry(d.country);
    out[c] = (out[c] || 0) + Number(d.count || 1);
  });

  return out;
}

/* ================= COUNTRY ANALYSIS ================= */
function analyzeCountryData(data, country) {
  let total = 0;
  let solved = 0;
  let notSolved = 0;

  data.forEach(d => {
    if (normalizeCountry(d.country) === country) {
      const c = Number(d.count || 1);

      total += c;

      if (Number(d.case_solved) === 1) {
        solved += c;
      } else {
        notSolved += c;
      }
    }
  });

  return {
    total,
    solved,
    notSolved,
    solvedPercentage: total ? ((solved / total) * 100).toFixed(2) : 0
  };
}

/* ================= STATE HELPERS ================= */
function filterByCountry(data, country) {
  return data.filter(d => normalizeCountry(d.country) === country);
}

/* ================= STATE COUNT ================= */
function countCrimesByState(data, country) {
  const out = {};

  data.forEach(d => {

    if (!d.state) return;

    if (!isNaN(d.state)) return;

    const s = normalizeState(d.state, country);

    if (!s || s === "null") return;

    out[s] = (out[s] || 0) + Number(d.count || 1);
  });

  return out;
}

/* ================= STATE ANALYSIS ================= */
function analyzeStateData(data, state, country) {
  let total = 0;
  let solved = 0;
  let notSolved = 0;

  const normalized = normalizeState(state, country);

  data.forEach(d => {

    if (normalizeState(d.state, country) === normalized) {

      const c = Number(d.count || 1);

      total += c;

      if (Number(d.case_solved) === 1) {
        solved += c;
      } else {
        notSolved += c;
      }
    }
  });

  return {
    total,
    solved,
    notSolved,
    solvedPercentage: total ? ((solved / total) * 100).toFixed(2) : 0
  };
}