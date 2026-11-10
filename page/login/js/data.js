"use strict";

const siteData = {
  admin: { id: 1, name: "Administrator" },
  patient: { id: 1, name: "Patient", email: "patient@example.com" },

  users: [
    { id: 1, name: "Ahmed", email: "ahmed@email.com", role: "Patient" },
    { id: 2, name: "Sarah", email: "sarah@email.com", role: "Pharmacist" },
  ],

  pharmacies: [
    { id: 1, name: "Central Pharmacy", location: "Algiers", phone: "0550 000 000", status: "Approved", open: true },
    { id: 2, name: "Health Pharmacy", location: "Oran", phone: "0660 000 000", status: "Pending", open: true },
  ],

  medicines: [
    { id: 1, name: "Paracetamol", category: "Pain Relief", description: "Pain relief and fever reduction", available: true, saved: true },
    { id: 2, name: "Vitamin C", category: "Vitamins", description: "Vitamin supplement", available: true, saved: true },
    { id: 3, name: "Ibuprofen", category: "Pain Relief", description: "Pain and inflammation relief", available: false, saved: false },
  ],

  activity: [
    { id: 1, type: "New user", description: "A patient registered.", date: "10/11/2026" },
    { id: 2, type: "New pharmacy", description: "A pharmacy requested registration.", date: "10/11/2026" },
    { id: 3, type: "Medicine search", description: "A user searched for Paracetamol.", date: "10/11/2026" },
  ],

  searches: [
    { id: 1, medicine: "Paracetamol", date: "10/11/2026", found: true },
    { id: 2, medicine: "Vitamin C", date: "09/11/2026", found: true },
  ],

  searchesToday: 18,
};