// ============================================================
// CONFIG_TAMPLAR v2.1 — reguli FINALE validate cu Cozma (18.07.2026)
// ============================================================

export const CONFIG_TAMPLAR = {
  afisarePret: true,
  modAdaos: "global",
  adaosGlobal: 2.5,
  pierderi: 1.10,
  diverseProcent: 0.01,
  balamaPer50cm: true,
  cursEur: 5.05,
  tva: 0.21,
  grosimi: { PAL: 18, PFL: 3 },
  layout: { fractieSusJos: 0.62 },
  adaosuri: {
    pal: 2.2,
    mdf_vopsit: 2.2,
    mdf_infoliat: 2.2,
    lemn: 2.2,
    glisare_dressing: 2.2,
    accesorii: 2.2,
  },

  materialeCorp: {
    "PAL melaminat":  { hex: "#c9a36a", tex: ["#c9a36a", "#7a5a2e"], pretMp: 84, clasa: "pal" },
    "PAL uni":        { hex: "#d8c9b0", tex: null, pretMp: 45, clasa: "pal" },
    "PAL lucios":     { hex: "#ececea", tex: null, pretMp: 95, clasa: "pal" },
    "PAL economic":   { hex: "#bdbdb5", tex: null, pretMp: 29, clasa: "pal" },
    "MDF":            { hex: "#7d8a6f", tex: null, pretMp: 370, clasa: "mdf_vopsit" },
    "MDF infoliat mat":    { hex: "#e8e4dd", tex: null, pretMp: 200, clasa: "mdf_infoliat" },
    "MDF infoliat lucios": { hex: "#f0ece5", tex: null, pretMp: 255, clasa: "mdf_infoliat" },
    "MDF frezat":      { hex: "#d8c9b0", tex: null, pretMp: 405, clasa: "mdf_vopsit" },
    "ROKO (riflaj)":   { hex: "#d4c5b0", tex: null, pretMp: 180, clasa: "mdf_infoliat" },
    "Front riflat":    { hex: "#c9b89e", tex: null, pretMp: 300, clasa: "mdf_infoliat" },
    "Oglinda montata": { hex: "#c0c8d0", tex: null, pretMp: 185, clasa: "mdf_vopsit" },
  },

  accesorii: {
    "Balamale": {
      "Hafele": { prod: "Hafele", pret: 6, regula: "perUsa" },
      "Blum":   { prod: "Blum", pret: 12, regula: "perUsa" },
    },
    "Sertare": {
      "Sertar metalic soft-close": { prod: "Blum", pret: 45, regula: "perSertar" },
      "Sertar cu pereti din PAL":  { prod: "std", pret: 25, regula: "perSertar" },
    },
    "Sisteme de ridicare": {
      "Aventos HL":    { prod: "Blum", pret: 120, regula: "perUsa" },
      "Aventos HK-XS": { prod: "Blum", pret: 70, regula: "perUsa" },
    },
    "Picioare & plinte": {
      "Picioare reglabile H120": { prod: "std", pret: 5, regula: "perCorp" },
      "Plinta":                  { prod: "std", pret: 120, regula: "fix" },
      "Piston ridicare 100N":    { prod: "std", pret: 12.4, regula: "perUsa" },
    },
  },

  bucatarie: {
    pretMlStandardEur: 1200,
    standardInclude: "blat+contrablat termo 38/10mm, fronturi MDF vopsit drept 1 fata, 4 sertare, balamale soft-close, sertare metalice soft-close, jolly premium, scurgator inox, sertar tacamuri, orice depozitare",
    optionale: {
      "Blat HPL compact":     { pretMlEur: 150 },
      "Blat piatra":          { pretMlEur: 350 },
      "Coloana electrocasnice": { pretBucEur: 250 },
      "Iluminat LED":         { pretBucEur: 80 },
    },
  },

  modeleLayout: {
    tot_usi:      { nume: "Tot uși", sertarePerTurn: 0, politePerTurn: 4, vitrina: false, deschis: false },
    usi_sertare:  { nume: "Uși + sertare jos", sertarePerTurn: 2, politePerTurn: 3, vitrina: false, deschis: false },
    cu_vitrina:   { nume: "Cu vitrină", sertarePerTurn: 1, politePerTurn: 3, vitrina: true, deschis: false },
    deschis:      { nume: "Rafturi deschise", sertarePerTurn: 0, politePerTurn: 5, vitrina: false, deschis: true },
  },

  tipuri: {
    dulap: {
      nume: "Dulap",
      suspendabil: false,
      suprapozabil: true,
      blat: false,
      maxTurnuri: 4,
      limite: {
        latime:   { min: 600, max: 2400, pas: 50 },
        inaltime: { min: 1400, max: 2450, pas: 50 },
        adancime: { min: 400, max: 650, pas: 50 },
      },
      default: { latime: 1500, inaltime: 2000, adancime: 600, turnuri: 3, model: "usi_sertare" },
    },
    dressing: {
      nume: "Dressing",
      suspendabil: false,
      suprapozabil: true,
      blat: false,
      maxTurnuri: 6,
      limite: {
        latime:   { min: 1000, max: 3600, pas: 50 },
        inaltime: { min: 1800, max: 2600, pas: 50 },
        adancime: { min: 400, max: 650, pas: 50 },
      },
      default: { latime: 2400, inaltime: 2200, adancime: 600, turnuri: 3, model: "usi_sertare" },
    },
    comoda: {
      nume: "Comodă",
      suspendabil: true,
      suprapozabil: false,
      blat: true,
      maxTurnuri: 3,
      limite: {
        latime:   { min: 400, max: 1600, pas: 50 },
        inaltime: { min: 400, max: 1200, pas: 50 },
        adancime: { min: 300, max: 550, pas: 50 },
      },
      default: { latime: 1000, inaltime: 700, adancime: 450, turnuri: 2, model: "usi_sertare" },
    },
    baie: {
      nume: "Dulap baie",
      suspendabil: true,
      suprapozabil: false,
      blat: true,
      maxTurnuri: 2,
      limite: {
        latime:   { min: 400, max: 1200, pas: 50 },
        inaltime: { min: 400, max: 900, pas: 50 },
        adancime: { min: 250, max: 500, pas: 50 },
      },
      default: { latime: 600, inaltime: 550, adancime: 450, turnuri: 1, model: "usi_sertare" },
    },
  },

  livrare: {
    termenEstimativ: "50 zile lucrătoare",
    zone: ["Neamț", "Iași", "Bacău", "Suceava", "Altă zonă (cu transport)"],
  },

  pachete: {
    eco:      { nume: "Economic" },
    standard: { nume: "Standard" },
    premium:  { nume: "Premium" },
  },
};