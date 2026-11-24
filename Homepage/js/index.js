// Frontend DOM manipulation, theme toggling, routing, and UI rendering

import * as Api from "./api.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const root = document.documentElement;
const themeButton = $("#theme-toggle");
let pharmacies = [];
let isAdmin = false;
let status = Api.sb ? "Loading pharmacies…" : "Database not configured yet: fill in js/config.js.";
let editingId = null;
let selectedDutyId = null;

function isDark() {
  const theme = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  return theme === "dark";
}
function showThemeIcon() {
  themeButton.textContent = isDark() ? "☀" : "☾";
}
themeButton.onclick = () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  showThemeIcon();
};
showThemeIcon();

function showPage() {
  const pages = $$("main > .page");
  const wanted = location.hash.slice(1);
  const id = pages.some(page => page.id === wanted) ? wanted : "home";

  pages.forEach(page => (page.hidden = page.id !== id));
  $$("nav a").forEach(link => link.setAttribute("aria-current", link.hash === "#" + id ? "page" : "false"));
  scrollTo(0, 0);
}
addEventListener("hashchange", showPage);
showPage();

async function loadPharmacies() {
  const { data, error } = await Api.fetchPharmacies();
  if (error && typeof error === "object") {
    pharmacies = [];
    status = "Could not load pharmacies: " + error.message;
  } else {
    pharmacies = data;
    status = "";
  }
  renderAll();
}

const esc = value =>
  String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const toMinutes = time => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
function isOpenNow(p) {
  if (!p.opens || !p.closes) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const from = toMinutes(p.opens);
  const to = toMinutes(p.closes);
  return from <= to ? current >= from && current < to : current >= from || current < to;
}
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const hoursText = p => (p.opens && p.closes ? ` · 🕗 ${esc(p.opens)} – ${esc(p.closes)}` : "");
const phoneText = p =>
  p.phone ? `📞 <a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a>` : "📞 No phone";

function statusTags(p) {
  const open = isOpenNow(p);
  let tags = "";
  if (open === true) tags += '<span class="tag green">Open now</span>';
  if (open === false) tags += '<span class="tag red">Closed</span>';
  if (p.duty === today()) tags += '<span class="tag amber">On duty</span>';
  return tags;
}

function rowInfo(p) {
  return `
    <span class="thumb" aria-hidden="true">✚</span>
    <section class="row-info">
      <h3>${esc(p.name)}</h3>
      <address>
        <small>📍 ${esc(p.area)}</small>
        <small>${phoneText(p)}${hoursText(p)}</small>
      </address>
    </section>`;
}

function filterPharmacies() {
  const text = $("#filter-text").value.trim().toLowerCase();
  const list = pharmacies.filter(p => `${p.name} ${p.area}`.toLowerCase().includes(text));

  $("#ph-results").innerHTML = list
    .map(p => {
      const adminButtons = isAdmin
        ? `<button class="btn outline small" type="button" data-edit="${esc(p.id)}" aria-label="Edit ${esc(p.name)}">Edit</button>
           <button class="btn outline small danger" type="button" data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">Remove</button>`
        : "";
      return `<li><article class="row">${rowInfo(p)}<p class="row-tags">${statusTags(p)}${adminButtons}</p></article></li>`;
    })
    .join("");

  $("#ph-count").textContent = list.length;
  $("#ph-empty").hidden = list.length > 0;
  $("#ph-empty").textContent =
    status || (pharmacies.length ? "No pharmacies match your search." : "No pharmacies have been added yet.");
}
$("#filter-text").addEventListener("input", filterPharmacies);

$("#ph-results").addEventListener("click", async event => {
  if (!isAdmin) return;
  const editButton = event.target.closest("[data-edit]");
  if (editButton) return startEdit(editButton.dataset.edit);

  const button = event.target.closest("[data-remove]");
  if (!button || !confirm("Remove this pharmacy?")) return;
  const { error } = await Api.deletePharmacy(button.dataset.remove);
  if (error) return alert("Could not remove: " + error.message);
  if (editingId === button.dataset.remove) stopEdit();
  loadPharmacies();
});

function startEdit(id) {
  const p = pharmacies.find(item => item.id === id);
  if (!p) return;
  const f = $("#add-form").elements;
  f.name.value = p.name;
  f.area.value = p.area;
  f.phone.value = p.phone;
  f.opens.value = p.opens;
  f.closes.value = p.closes;
  f.duty.value = p.duty;
  f.meds.value = p.meds.join(", ");

  editingId = id;
  $("#add-box").open = true;
  $("#add-summary").textContent = `Editing: ${p.name}`;
  $("#form-submit").textContent = "Update pharmacy";
  $("#form-cancel").hidden = false;
  $("#add-box").scrollIntoView({ behavior: "smooth", block: "start" });
  f.name.focus();
}
function stopEdit() {
  editingId = null;
  $("#add-form").reset();
  $("#add-summary").textContent = "+ Add a pharmacy";
  $("#form-submit").textContent = "Save pharmacy";
  $("#form-cancel").hidden = true;
}
$("#form-cancel").onclick = () => {
  stopEdit();
  $("#add-box").open = false;
};

$("#add-form").onsubmit = async event => {
  event.preventDefault();
  if (!isAdmin) return;
  const f = event.target.elements;
  const data = {
    name: f.name.value.trim(),
    area: f.area.value.trim(),
    phone: f.phone.value.trim(),
    opens: f.opens.value,
    closes: f.closes.value,
    duty: f.duty.value,
    meds: f.meds.value.split(",").map(m => m.trim()).filter(Boolean),
  };
  if (!data.name || !data.area) return;

  const { error } = await Api.savePharmacy(data, editingId);
  if (error) return alert("Could not save: " + error.message);

  stopEdit();
  $("#add-box").open = false;
  loadPharmacies();
};

$("#export-data").onclick = () => {
  const rows = pharmacies.map(({ id, ...rest }) => rest);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pharmacies.json";
  link.click();
  URL.revokeObjectURL(link.href);
};

$("#import-data").onchange = event => {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file || !isAdmin) return;

  const reader = new FileReader();
  reader.onload = async () => {
    let rows;
    try {
      const items = JSON.parse(reader.result);
      if (!Array.isArray(items)) throw new Error("Not a list");
      rows = items
        .filter(p => p && p.name && p.area)
        .map(p =>
          Api.toDb({
            name: String(p.name).trim(),
            area: String(p.area).trim(),
            phone: String(p.phone || "").trim(),
            opens: p.opens || "",
            closes: p.closes || "",
            duty: p.duty || "",
            meds: Array.isArray(p.meds) ? p.meds.map(m => String(m).trim()).filter(Boolean) : [],
          })
        );
    } catch {
      return alert("Could not read this file. Use a JSON list exported from this page.");
    }
    if (!rows.length) return alert("No valid pharmacies found in this file.");
    const { error } = await Api.bulkInsertPharmacies(rows);
    if (error) return alert("Import failed: " + error.message);
    alert(`${rows.length} pharmacies imported.`);
    loadPharmacies();
  };
  reader.readAsText(file);
};

$("#clear-data").onclick = async () => {
  if (!isAdmin || !pharmacies.length || !confirm("Delete ALL pharmacies? This cannot be undone.")) return;
  const { error } = await Api.deleteAllPharmacies();
  if (error) return alert("Could not delete: " + error.message);
  stopEdit();
  loadPharmacies();
};

let medicineNames = [];

function refreshMedicineOptions() {
  const seen = new Map();
  pharmacies.forEach(p => p.meds.forEach(m => seen.has(m.toLowerCase()) || seen.set(m.toLowerCase(), m)));
  medicineNames = [...seen.values()].sort((a, b) => a.localeCompare(b));
  $("#meds").innerHTML = medicineNames.map(m => `<option value="${esc(m)}"></option>`).join("");

  const select = $("#filter-area");
  const previous = select.value;
  const areas = [...new Set(pharmacies.map(p => p.area))].sort((a, b) => a.localeCompare(b));
  select.innerHTML = ["All", ...areas].map(a => `<option>${esc(a)}</option>`).join("");
  select.value = ["All", ...areas].includes(previous) ? previous : "All";
}

function filterMedicines() {
  const typed = $("#filter-med").value.trim();
  const medicine = medicineNames.find(name => name.toLowerCase() === typed.toLowerCase());
  const area = $("#filter-area").value;
  const availability = $("#filter-avail").value;
  const openOnly = $("#filter-open").checked;

  $("#page-title").textContent = medicine ? `Results for "${medicine}"` : "Search medicines";
  $("#unknown").hidden = !typed || Boolean(medicine);
  $("#unknown").textContent = medicineNames.length
    ? `No medicine named “${typed}” in our list. Try: ${medicineNames.join(", ")}.`
    : `No medicine named “${typed}”: no pharmacy has listed its medicines yet.`;

  const hasMed = p => Boolean(medicine) && p.meds.some(m => m.toLowerCase() === medicine.toLowerCase());
  const list = pharmacies.filter(p => {
    const inStock = hasMed(p);
    const okStock = !medicine || availability === "All" || (availability === "Available") === inStock;
    const okOpen = !openOnly || isOpenNow(p) === true;
    const okArea = area === "All" || p.area === area;
    return okStock && okOpen && okArea;
  });

  $("#med-results").innerHTML = list
    .map(p => {
      const stock = medicine
        ? `<span class="tag stock-tag ${hasMed(p) ? "green" : "red"}">${hasMed(p) ? "Available" : "Out of stock"}</span>`
        : "";
      return `<li><article class="row">${rowInfo(p)}<p class="row-tags">${stock}${statusTags(p)}</p></article></li>`;
    })
    .join("");

  $("#med-count").textContent = list.length;
  $("#med-empty").hidden = list.length > 0;
  $("#med-empty").textContent = status || "No pharmacies to show. Clear a filter to see more.";
}
$("#medicines").addEventListener("input", filterMedicines);

$("#home-search").onsubmit = event => {
  event.preventDefault();
  const text = event.target.elements.q.value;

  if ($("#kind").value === "pharmacy") {
    $("#filter-text").value = text;
    filterPharmacies();
    location.hash = "pharmacies";
  } else {
    $("#filter-med").value = text;
    filterMedicines();
    location.hash = "medicines";
  }
};

const pinPosition = id => {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) % 9973;
  return { left: 10 + (n % 80), top: 15 + (Math.floor(n / 80) % 70) };
};

function renderDuty() {
  const date = $("#duty-date").value;
  const list = pharmacies.filter(p => p.duty && p.duty === date);
  if (!list.some(p => p.id === selectedDutyId)) selectedDutyId = null;

  $("#duty-list").innerHTML = list
    .map(
      p => `<li><button class="row" type="button" data-id="${esc(p.id)}" aria-pressed="${p.id === selectedDutyId}">
        <span class="thumb" aria-hidden="true">✚</span>
        <span class="row-info">
          <strong>${esc(p.name)}</strong>
          <small>📍 ${esc(p.area)}</small>
          <small>${p.opens && p.closes ? `🕗 ${esc(p.opens)} – ${esc(p.closes)} · ` : ""}<span class="duty-date">${esc(date)}</span></small>
        </span>
        <span class="tag amber">On duty</span></button></li>`
    )
    .join("");

  $(".map").innerHTML = list
    .map(p => {
      const pos = pinPosition(p.id);
      return `<button class="pin" type="button" data-id="${esc(p.id)}" aria-pressed="${p.id === selectedDutyId}"
        aria-label="${esc(p.name)}" title="${esc(p.name)}" style="left:${pos.left}%;top:${pos.top}%"></button>`;
    })
    .join("");

  $("#duty-empty").hidden = list.length > 0;
  $("#duty-empty").textContent = status || "No pharmacy is registered on night duty for this date.";
}
$("#night-duty").addEventListener("click", event => {
  const clicked = event.target.closest("[data-id]");
  if (!clicked) return;
  selectedDutyId = selectedDutyId === clicked.dataset.id ? null : clicked.dataset.id;
  $$("#night-duty [data-id]").forEach(item =>
    item.setAttribute("aria-pressed", String(item.dataset.id === selectedDutyId))
  );
});
$("#duty-date").value = today();
$("#duty-date").oninput = renderDuty;

function renderAll() {
  refreshMedicineOptions();
  filterPharmacies();
  filterMedicines();
  renderDuty();
}

const form = $("#auth-form");
const message = $("#message");
const authLink = $("#auth-link");
const stepEmail = $("#step-email");
const stepOtp = $("#step-otp");
const emailInput = $("#auth-email");
const otpInput = $("#auth-otp");
const btnSendCode = $("#btn-send-code");
const btnBackEmail = $("#btn-back-email");
const sentEmailLabel = $("#sent-email-label");

function say(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
}

function showOtpStep(email) {
  sentEmailLabel.textContent = email;
  stepEmail.hidden = true;
  stepOtp.hidden = false;
  otpInput.value = "";
  otpInput.focus();
}

function showEmailStep() {
  stepOtp.hidden = true;
  stepEmail.hidden = false;
  emailInput.focus();
}

async function refreshAdmin() {
  isAdmin = await Api.checkAdminSession();
  $$(".admin-only").forEach(el => (el.hidden = !isAdmin));
  authLink.textContent = isAdmin ? "Log out" : "Admin";
  authLink.setAttribute("href", isAdmin ? "#home" : "#login");
  if (!isAdmin) stopEdit();
  renderAll();
  return isAdmin;
}

authLink.addEventListener("click", async () => {
  if (isAdmin) {
    await Api.signOutUser();
    refreshAdmin();
  }
});

if (Api.sb) Api.sb.auth.onAuthStateChange(() => setTimeout(refreshAdmin, 0));

emailInput.addEventListener("input", () => say(""));
otpInput.addEventListener("input", () => say(""));

btnSendCode.addEventListener("click", async () => {
  if (!Api.sb) return say("The database is not configured yet (js/config.js).");
  const email = emailInput.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return say("Enter a valid email address.");

  say("Checking authorization…", true);

  const { isAdmin: isEmailAdmin, error: adminErr } = await Api.checkAdminEmail(email);
  if (adminErr || !isEmailAdmin) {
    return say("Access denied: Account is not an administrator.");
  }

  say("Sending verification code…", true);

  const { error } = await Api.requestOtpCode(email);
  if (error) {
    say(`Could not send code: ${error.message}`);
  } else {
    say("Verification code sent! Please check your email inbox.", true);
    showOtpStep(email);
  }
});

btnBackEmail.addEventListener("click", () => {
  say("");
  showEmailStep();
});

form.onsubmit = async event => {
  event.preventDefault();
  if (stepOtp.hidden) return;

  if (!Api.sb) return say("The database is not configured yet (js/config.js).");
  const email = emailInput.value.trim();
  const token = otpInput.value.trim();

  if (!token) return say("Please enter the verification code.");

  say("Verifying code…", true);

  const { error } = await Api.verifyOtpCode(email, token);
  if (error) {
    say(`Invalid code: ${error.message}`);
  } else if (await refreshAdmin()) {
    form.reset();
    showEmailStep();
    say("");
    location.hash = "pharmacies";
  } else {
    say("This account is not an administrator.");
  }
};

renderAll();
loadPharmacies();
refreshAdmin();