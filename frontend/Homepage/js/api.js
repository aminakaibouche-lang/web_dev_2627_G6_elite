(() => {
  const DB_KEY = "healpath.pharmacies.v1";
  const SESSION_KEY = "healpath.admin.v1";
  const DEMO_ADMIN = { email: "admin@healpath.dz", password: "admin123" };

  const iso = offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Duty dates are relative to today so the demo always shows something.
  const seed = () => [
    { id: "p-101", name: "Pharmacie El Amal", area: "Zeralda", phone: "0555 12 34 56", opens: "08:00", closes: "21:00", duty: iso(0),
      meds: ["Paracetamol", "Ibuprofen", "Vitamin C", "Amoxicillin"] },
    { id: "p-102", name: "Pharmacie Ibn Sina", area: "Staoueli", phone: "0661 23 45 67", opens: "09:00", closes: "19:00", duty: "",
      meds: ["Paracetamol", "Aspirin", "Omeprazole"] },
    { id: "p-103", name: "Pharmacie Centrale", area: "Centre Ville", phone: "023 45 67 89", opens: "07:30", closes: "22:00", duty: iso(1),
      meds: ["Ibuprofen", "Loratadine", "Vitamin C", "Metformin"] },
    { id: "p-104", name: "Pharmacie El Chifa", area: "Bab Ezzouar", phone: "0770 34 56 78", opens: "20:00", closes: "06:00", duty: iso(0),
      meds: ["Paracetamol", "Amoxicillin", "Salbutamol"] },
    { id: "p-105", name: "Pharmacie Hydra Santé", area: "Hydra", phone: "0550 45 67 89", opens: "08:30", closes: "20:00", duty: "",
      meds: ["Aspirin", "Omeprazole", "Loratadine", "Vitamin C"] },
    { id: "p-106", name: "Pharmacie Les Sources", area: "Zeralda", phone: "", opens: "08:00", closes: "18:00", duty: iso(2),
      meds: ["Ibuprofen", "Metformin"] },
  ];

  const read = () => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const fresh = seed();
    write(fresh);
    return fresh;
  };
  function write(rows) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(rows)); } catch {}
  }
  const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
  const newId = () => "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.Api = {
    sb: true, // pretend the "database" is configured

    toDb: p => p,

    async fetchPharmacies() {
      await wait();
      return { data: read(), error: null };
    },

    async savePharmacy(data, id = null) {
      await wait();
      const rows = read();
      if (id) {
        const i = rows.findIndex(p => p.id === id);
        if (i === -1) return { error: new Error("Pharmacy not found") };
        rows[i] = { ...rows[i], ...data };
      } else {
        rows.unshift({ id: newId(), ...data });
      }
      write(rows);
      return { error: null };
    },

    async deletePharmacy(id) {
      await wait();
      write(read().filter(p => p.id !== id));
      return { error: null };
    },

    async bulkInsertPharmacies(items) {
      await wait();
      write([...items.map(p => ({ id: newId(), ...p })), ...read()]);
      return { error: null };
    },

    async deleteAllPharmacies() {
      await wait();
      write([]);
      return { error: null };
    },

    // ---- Fake admin auth (email + password) ----
    async signIn(email, password) {
      await wait(300);
      if (email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
        return { error: null };
      }
      return { error: new Error("Wrong email or password.") };
    },
    async checkAdminSession() {
      try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
    },
    async signOutUser() {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    },

    // Dev helper: window.Api.resetDemoData() in the console restores the seed data.
    resetDemoData() {
      localStorage.removeItem(DB_KEY);
      location.reload();
    },
  };
})();
