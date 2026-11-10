"use strict";

const stats = document.querySelector("#stats");
const usersBody = document.querySelector("#usersBody");
const pharmaciesBody = document.querySelector("#pharmaciesBody");
const medicinesBody = document.querySelector("#medicinesBody");
const activityBody = document.querySelector("#activityBody");

function renderStats() {
  fillStats(stats, [
    { value: siteData.users.length, label: "Registered users" },
    { value: siteData.pharmacies.length, label: "Registered pharmacies" },
    { value: siteData.medicines.length, label: "Medicines" },
    { value: siteData.searchesToday, label: "New searches today" },
  ]);
}

function renderUsers() {
  fillTable(usersBody, siteData.users.map((u) => row([
    u.id, u.name, u.email, u.role,
    actionButton("Delete", "delete", "users", u.id, "btn-danger"),
  ])), 5, "No users yet. Use the add button to create one.");
}

function renderPharmacies() {
  fillTable(pharmaciesBody, siteData.pharmacies.map((p) => {
    const actions = [];
    if (p.status === "Pending") {
      actions.push(actionButton("Approve", "approve", "pharmacies", p.id), " ");
    }
    actions.push(actionButton("Delete", "delete", "pharmacies", p.id, "btn-danger"));

    return row([
      p.id, p.name, p.location,
      badge(p.status, p.status === "Approved" ? "ok" : "wait"),
      actions,
    ]);
  }), 5, "No pharmacies yet. Use the add button to create one.");
}

function renderMedicines() {
  fillTable(medicinesBody, siteData.medicines.map((m) => row([
    m.id, m.name, m.category,
    badge(m.available ? "Available" : "Unavailable", m.available ? "ok" : "no"),
    actionButton("Delete", "delete", "medicines", m.id, "btn-danger"),
  ])), 5, "No medicines yet. Use the add button to create one.");
}

function renderActivity() {
  fillTable(activityBody, siteData.activity.map((a) => row([
    a.type, a.description, a.date,
  ])), 3, "No activity yet.");
}

function renderAll() {
  renderStats();
  renderUsers();
  renderPharmacies();
  renderMedicines();
  renderActivity();
}

function addItem(type) {
  const list = siteData[type];

  if (type === "users") {
    const name = prompt("Enter user name:");
    const email = prompt("Enter user email:");
    if (!name || !email) return;
    list.push({ id: nextId(list), name, email, role: "Patient" });
  }

  if (type === "pharmacies") {
    const name = prompt("Enter pharmacy name:");
    const location = prompt("Enter pharmacy location:");
    if (!name || !location) return;
    list.push({ id: nextId(list), name, location, phone: "-", status: "Pending", open: false });
  }

  if (type === "medicines") {
    const name = prompt("Enter medicine name:");
    const category = prompt("Enter medicine category:");
    if (!name || !category) return;
    list.push({ id: nextId(list), name, category, description: "", available: true, saved: false });
  }

  renderAll();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, type } = button.dataset;
  const id = Number(button.dataset.id);

  if (action === "add") {
    addItem(type);
  }

  if (action === "delete" && confirm("Are you sure you want to delete this record?")) {
    siteData[type] = siteData[type].filter((item) => item.id !== id);
    renderAll();
  }

  if (action === "approve") {
    const pharmacy = siteData.pharmacies.find((p) => p.id === id);
    if (pharmacy) {
      pharmacy.status = "Approved";
      renderAll();
    }
  }
});

document.querySelector("#adminName").textContent = siteData.admin.name;
document.querySelector("#adminAvatar").textContent = siteData.admin.name.charAt(0);
renderAll();