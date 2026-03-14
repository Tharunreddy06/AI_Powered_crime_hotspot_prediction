function selectDomain(domain) {
    localStorage.setItem("selectedDomain", domain);
    window.location.href = "map.html";
  }
  function searchPlace() {
  const place = document.getElementById("placeSearch").value.trim();

  if (!place) {
    alert("Please enter a place name");
    return;
  }

  // store searched place
  localStorage.setItem("searchedPlace", place);

  // if domain not selected, default to ALL
  if (!localStorage.getItem("selectedDomain")) {
    localStorage.setItem("selectedDomain", "ALL");
  }

  // go to map page
  window.location.href = "map.html";
}
