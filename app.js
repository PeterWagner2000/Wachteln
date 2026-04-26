const STORAGE_KEY = "wachtel_cashflow_v1";
const START_SALDO = 10000;

const kategorien = {
  Einnahme: ["Verkauf Wachteln", "Verkauf Eier", "Verkauf Zubehör", "Verkauf Fleisch", "Sonstige Einnahmen"],
  Ausgabe: [
    "Kauf Bruteier",
    "Futter",
    "Einstreu",
    "Wasser/Tränke",
    "Strom",
    "Brutgeräte",
    "Stallmaterial",
    "Medikamente/Vitamine",
    "Transport",
    "Tierarzt",
    "Marketing",
    "Abschreibungen",
    "Sonstiges"
  ]
};

const state = {
  startSaldo: START_SALDO,
  eintraege: []
};

const datumInput = document.getElementById("datum");
const typSelect = document.getElementById("typ");
const kategorieSelect = document.getElementById("kategorie");
const beschreibungInput = document.getElementById("beschreibung");
const betragInput = document.getElementById("betrag");
const saldoDiv = document.getElementById("saldo");
const tabelleBody = document.getElementById("tabelle");

const eintragBtn = document.getElementById("eintragBtn");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const resetBtn = document.getElementById("resetBtn");

function formatCurrency(value) {
  return Number(value).toLocaleString("de-DE", { maximumFractionDigits: 2 });
}

function formatDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function fillTypOptions() {
  typSelect.innerHTML = "";
  Object.keys(kategorien).forEach((typ) => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ;
    typSelect.appendChild(option);
  });
}

function updateKategorieDropdown() {
  const typ = typSelect.value;
  kategorieSelect.innerHTML = "";

  kategorien[typ].forEach((kat) => {
    const option = document.createElement("option");
    option.value = kat;
    option.textContent = kat;
    kategorieSelect.appendChild(option);
  });
}

function calculateSaldoUntil(indexInclusive) {
  let saldo = state.startSaldo;

  for (let i = 0; i <= indexInclusive; i += 1) {
    const eintrag = state.eintraege[i];
    saldo += eintrag.typ === "Einnahme" ? eintrag.betrag : -eintrag.betrag;
  }

  return saldo;
}

function renderTableAndSaldo() {
  tabelleBody.innerHTML = "";

  if (state.eintraege.length === 0) {
    const startRow = document.createElement("tr");
    startRow.innerHTML = `<td>-</td><td>-</td><td>Startkapital</td><td>Startwert</td><td>${formatCurrency(
      state.startSaldo
    )}</td><td></td><td>${formatCurrency(state.startSaldo)}</td>`;
    tabelleBody.appendChild(startRow);
    saldoDiv.innerText = `Saldo: ${formatCurrency(state.startSaldo)} Kč`;
    return;
  }

  state.eintraege.forEach((eintrag, index) => {
    const saldo = calculateSaldoUntil(index);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(eintrag.datum)}</td>
      <td>${eintrag.typ}</td>
      <td>${eintrag.kategorie}</td>
      <td>${eintrag.beschreibung || ""}</td>
      <td>${eintrag.typ === "Einnahme" ? formatCurrency(eintrag.betrag) : ""}</td>
      <td>${eintrag.typ === "Ausgabe" ? formatCurrency(eintrag.betrag) : ""}</td>
      <td>${formatCurrency(saldo)}</td>
    `;

    tabelleBody.appendChild(row);
  });

  const finalSaldo = calculateSaldoUntil(state.eintraege.length - 1);
  saldoDiv.innerText = `Saldo: ${formatCurrency(finalSaldo)} Kč`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.eintraege) && typeof parsed.startSaldo === "number") {
      state.eintraege = parsed.eintraege;
      state.startSaldo = parsed.startSaldo;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function addEntry() {
  const datum = datumInput.value;
  const typ = typSelect.value;
  const kategorie = kategorieSelect.value;
  const beschreibung = beschreibungInput.value.trim();
  const betrag = Number.parseFloat(betragInput.value);

  if (!datum || !typ || !kategorie || !Number.isFinite(betrag) || betrag <= 0) {
    alert("Bitte Datum, Typ, Kategorie und einen Betrag > 0 eingeben.");
    return;
  }

  state.eintraege.push({ datum, typ, kategorie, beschreibung, betrag });
  saveState();
  renderTableAndSaldo();

  beschreibungInput.value = "";
  betragInput.value = "";
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cashflow-wachtelzucht.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  file
    .text()
    .then((text) => {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.eintraege) || typeof parsed.startSaldo !== "number") {
        throw new Error("invalid");
      }

      state.eintraege = parsed.eintraege;
      state.startSaldo = parsed.startSaldo;
      saveState();
      renderTableAndSaldo();
      alert("Import erfolgreich.");
    })
    .catch(() => {
      alert("Import fehlgeschlagen. Bitte gültige JSON-Datei wählen.");
    })
    .finally(() => {
      importFile.value = "";
    });
}

function resetData() {
  const confirmed = window.confirm("Wirklich alle Daten löschen?");
  if (!confirmed) {
    return;
  }

  state.eintraege = [];
  state.startSaldo = START_SALDO;
  saveState();
  renderTableAndSaldo();
}

function init() {
  fillTypOptions();
  updateKategorieDropdown();
  loadState();
  renderTableAndSaldo();

  typSelect.addEventListener("change", updateKategorieDropdown);
  eintragBtn.addEventListener("click", addEntry);
  exportBtn.addEventListener("click", exportData);
  importFile.addEventListener("change", importData);
  resetBtn.addEventListener("click", resetData);

  datumInput.valueAsDate = new Date();
}

init();
