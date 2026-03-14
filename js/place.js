const place = localStorage.getItem("selectedPlace");
const placeType = localStorage.getItem("placeType");

document.getElementById("placeTitle").innerText =
  `${place} (${placeType.toUpperCase()})`;

loadCrimeData().then(data => {

  let filtered;

  if (placeType === "country") {
    filtered = data.filter(d => d.country === place);
  } else {
    filtered = data.filter(d => d.state === place);
  }

  let total = 0, solved = 0, unsolved = 0;

  filtered.forEach(d => {
    const c = Number(d.count);
    total += c;
    if (Number(d.case_solved) === 1) solved += c;
    else unsolved += c;
  });

  const percent = total > 0 ? ((solved / total) * 100).toFixed(2) : 0;

  document.getElementById("p_total").innerText = total;
  document.getElementById("p_solved").innerText = solved;
  document.getElementById("p_unsolved").innerText = unsolved;
  document.getElementById("p_percent").innerText = percent;

  loadSafety(place);
  loadPlaces(place);
});
function loadSafety(place) {
  const safety = {
    "Delhi": [
      "Avoid poorly lit areas at night",
      "Use registered transport services",
      "Keep emergency contacts handy"
    ],
    "India": [
      "Be cautious in crowded places",
      "Follow local laws and advisories"
    ]
  };

  const list = document.getElementById("safetyList");
  (safety[place] || ["Stay alert and follow local guidelines"])
    .forEach(item => {
      const li = document.createElement("li");
      li.innerText = item;
      list.appendChild(li);
    });
}
function loadPlaces(place) {
  const places = {
    "Delhi": ["India Gate", "Qutub Minar", "Red Fort"],
    "Karnataka": ["Mysuru Palace", "Coorg", "Hampi"],
    "India": ["Taj Mahal", "Jaipur", "Kerala"]
  };

  const list = document.getElementById("visitList");
  (places[place] || ["Tourist information not available"])
    .forEach(p => {
      const li = document.createElement("li");
      li.innerText = p;
      list.appendChild(li);
    });
}
