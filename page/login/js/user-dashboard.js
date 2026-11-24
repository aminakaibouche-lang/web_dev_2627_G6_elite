"use strict";

const stats = document.querySelector("#stats");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#medicineSearch");
const medicineResults = document.querySelector("#medicineResults");
const pharmacyList = document.querySelector("#pharmacyList");
const historyBody = document.querySelector("#historyBody");
const profileCard = document.querySelector("#profileCard");

function approvedPharmacies() {
  return siteData.pharmacies.filter((p) => p.status === "Approved");
}

function renderStats() {
  fillStats(stats, [
    { value: siteData.searches.length, label: "Medicine searches" },
    { value: approvedPharmacies().length, label: "Nearby pharmacies" },
    { value: siteData.medicines.filter((m) => m.saved).length, label: "Saved medicines" },
  ]);
}

function medicineCard(medicine) {
  const card = el("div", "", "item-card");
  card.dataset.id = medicine.id;
  card.append(
    el("h3", medicine.name),
    el("p", medicine.description),
    badge(medicine.available ? "Available" : "Unavailable", medicine.available ? "ok" : "no"),
    actionButton(medicine.saved ? "Saved" : "Save", "save", "medicines", medicine.id, "btn-ghost")
  );
  return card;
}

function renderMedicines(query = "") {
  const q = query.trim().toLowerCase();
  const results = siteData.medicines.filter((m) =>
    `${m.name} ${m.description}`.toLowerCase().includes(q)
  );

  medicineResults.replaceChildren(
    ...(results.length
      ? results.map(medicineCard)
      : [el("p", "No medicine matches your search. Try another name.", "empty")])
  );
}

function renderPharmacies() {
  pharmacyList.replaceChildren(
    ...approvedPharmacies().map((p) => {
      const card = el("div", "", "item-card");
      card.dataset.id = p.id;
      card.append(
        el("h3", p.name),
        el("p", `Location: ${p.location}`),
        el("p", `Phone: ${p.phone}`),
        badge(p.open ? "Open" : "Closed", p.open ? "ok" : "no")
      );
      return card;
    })
  );
}

function renderHistory() {
  fillTable(historyBody, siteData.searches.map((s) => row([
    s.medicine, s.date, badge(s.found ? "Found" : "Not found", s.found ? "ok" : "no"),
  ])), 3, "No searches yet. Find a medicine to get started.");
}

function renderProfile() {
  const { name, email } = siteData.patient;

  const nameLine = el("p");
  nameLine.append(el("strong", "Name: "), name);
  const emailLine = el("p");
  emailLine.append(el("strong", "Email: "), email);

  profileCard.replaceChildren(
    nameLine,
    emailLine,
    actionButton("Edit profile", "edit-profile", "patient", siteData.patient.id)
  );

  document.querySelector("#userName").textContent = name;
  document.querySelector("#userAvatar").textContent = name.charAt(0);
}

searchInput.addEventListener("input", () => renderMedicines(searchInput.value));

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  renderMedicines(query);
  if (!query) return;

  siteData.searches.unshift({
    id: nextId(siteData.searches),
    medicine: query,
    date: new Date().toLocaleDateString("en-GB"),
    found: siteData.medicines.some((m) => m.name.toLowerCase().includes(query.toLowerCase())),
  });

  renderStats();
  renderHistory();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.action === "save") {
    const medicine = siteData.medicines.find((m) => m.id === id);
    if (medicine) {
      medicine.saved = !medicine.saved;
      renderStats();
      renderMedicines(searchInput.value);
    }
  }

  if (button.dataset.action === "edit-profile") {
    alert("Connect this to your profile editing page.");
  }
});

renderStats();
renderMedicines();
renderPharmacies();
renderHistory();
renderProfile();