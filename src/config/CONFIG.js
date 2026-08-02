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

  blaturi: {
    "Fără blat": { hex: "#e8e4dd" },
    "PAL melaminat": { hex: "#c9a36a" },
    "PAL uni": { hex: "#d8c9b0" },
    "PAL lucios": { hex: "#ececea" },
    "MDF": { hex: "#7d8a6f" },
    "HPL compact": { hex: "#8a7f72" },
  },

  accesoriiCategorii: {
    "Balamale": {
      "Hafele": { pret: 6, regula: "perUsa" },
      "Blum": { pret: 12, regula: "perUsa" },
    },
    "Sertare": {
      "Sertar metalic soft-close": { pret: 45, regula: "perSertar" },
      "Sertar cu pereti din PAL": { pret: 25, regula: "perSertar" },
    },
    "Sisteme de ridicare": {
      "Aventos HL": { pret: 120, regula: "perUsa" },
      "Aventos HK-XS": { pret: 70, regula: "perUsa" },
    },
    "Picioare & plinte": {
      "Picioare reglabile H120": { pret: 5, regula: "perCorp" },
      "Plinta": { pret: 120, regula: "fix" },
      "Piston ridicare 100N": { pret: 12.4, regula: "perUsa" },
    },
  },

  consumabile: {
    // Structură cerută de calcul.js: fiecare consumabil e {pret, um}.
    // (Înainte erau doar cantități — cantABS18:1.0 — ceea ce făcea calcul.js
    // să crape la .pret → pagină albă la orice categorie.)
    cantABS18: { pret: 25, um: "mp" },
    cantABS36: { pret: 35, um: "ml" },
    PFL:       { pret: 20, um: "mp" },
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

  // ── Chei cerute de calcul.js (v2.1), aduse din configurator-mobila ──
  pretStructuraPal: 84,
  finisaje: {
  "PAL melaminat (lemn)": {
    "finish": "lemn",
    "pretMp": 84,
    "clasa": "pal",
    "paleta": "lemn"
  },
  "MDF vopsit mat": {
    "finish": "mat",
    "pretMp": 170,
    "clasa": "mdf_vopsit",
    "paleta": "mat"
  },
  "MDF lucios": {
    "finish": "lucios",
    "pretMp": 230,
    "clasa": "mdf_infoliat",
    "paleta": "lucios"
  },
  "Riflaj": {
    "finish": "riflaj",
    "pretMp": 300,
    "clasa": "pal",
    "paleta": "riflaj"
  },
  "PAL uni (economic)": {
    "finish": "mat",
    "pretMp": 45,
    "clasa": "pal",
    "paleta": "mat"
  }
},
  palete: {
  "lemn": [
    {
      "nume": "Stejar natur",
      "hex": "#c8a878",
      "tex": [
        "#c8a878",
        "#6b4a28"
      ]
    },
    {
      "nume": "Stejar Sonoma",
      "hex": "#c9b48f",
      "tex": [
        "#c9b48f",
        "#8a6f45"
      ]
    },
    {
      "nume": "Melaminat auriu",
      "hex": "#c9a36a",
      "tex": [
        "#c9a36a",
        "#7a5a2e"
      ]
    },
    {
      "nume": "Frasin gri",
      "hex": "#b7ada0",
      "tex": [
        "#b7ada0",
        "#6d6357"
      ]
    },
    {
      "nume": "Nuc american",
      "hex": "#7a5236",
      "tex": [
        "#7a5236",
        "#3a2416"
      ],
      "addMp": 20
    },
    {
      "nume": "Wengé",
      "hex": "#4a3a2e",
      "tex": [
        "#4a3a2e",
        "#1e1712"
      ],
      "addMp": 20
    }
  ],
  "mat": [
    {
      "nume": "Alb",
      "hex": "#f2f1ec"
    },
    {
      "nume": "Crem",
      "hex": "#e8e4dd"
    },
    {
      "nume": "Bej nisip",
      "hex": "#d8c9b0"
    },
    {
      "nume": "Gri piatră",
      "hex": "#9a978f"
    },
    {
      "nume": "Antracit",
      "hex": "#35383b"
    },
    {
      "nume": "Negru",
      "hex": "#201f1e"
    },
    {
      "nume": "Bleumarin",
      "hex": "#2f3b52"
    },
    {
      "nume": "Verde salvie",
      "hex": "#8a9a84"
    },
    {
      "nume": "Verde măsliniu",
      "hex": "#5f6b4a"
    },
    {
      "nume": "Terracotta",
      "hex": "#b06a4e"
    }
  ],
  "lucios": [
    {
      "nume": "Alb lucios",
      "hex": "#f4f4f2"
    },
    {
      "nume": "Cașmir",
      "hex": "#e7ded0"
    },
    {
      "nume": "Gri lucios",
      "hex": "#b9b6b0"
    },
    {
      "nume": "Bleumarin lucios",
      "hex": "#28324a"
    },
    {
      "nume": "Negru lucios",
      "hex": "#171717"
    }
  ],
  "riflaj": [
    {
      "nume": "Stejar",
      "hex": "#c8a878"
    },
    {
      "nume": "Nuc",
      "hex": "#7a5236"
    },
    {
      "nume": "Alb",
      "hex": "#eae7df"
    },
    {
      "nume": "Antracit",
      "hex": "#35383b"
    },
    {
      "nume": "Negru",
      "hex": "#201f1e"
    }
  ]
},
  feronerie: {
  "Balama Hafele": {
    "pret": 6,
    "um": "buc"
  },
  "Balama Blum": {
    "pret": 12,
    "um": "buc"
  },
  "Sistem push to open": {
    "pret": 16,
    "um": "buc"
  },
  "Glisiera normala": {
    "pret": 16.3,
    "um": "set"
  },
  "Glisiera tandem GTV D500": {
    "pret": 50,
    "um": "set"
  },
  "Glisiera tandem Blum tip-on D500": {
    "pret": 71,
    "um": "set"
  },
  "Cos jolly amortizat Blum 150": {
    "pret": 350,
    "um": "buc"
  },
  "Cos jolly tip-on Blum 150": {
    "pret": 153,
    "um": "buc"
  },
  "Maner standard": {
    "pret": 12,
    "um": "buc"
  },
  "Maner profil negru": {
    "pret": 50,
    "um": "buc"
  },
  "Maner frezat MDF": {
    "pret": 40,
    "um": "ml"
  },
  "Riflaj MDF negru in cant": {
    "pret": 500,
    "um": "ml"
  },
  "Picioare reglabile H120": {
    "pret": 5,
    "um": "buc"
  },
  "Plinta": {
    "pret": 120,
    "um": "buc"
  },
  "Picurator 900": {
    "pret": 150,
    "um": "buc"
  },
  "Piston ridicare 100N": {
    "pret": 12.4,
    "um": "buc"
  },
  "Aventos HK-XS": {
    "pret": 70,
    "um": "buc"
  },
  "Sistem coborare usa": {
    "pret": 25,
    "um": "buc"
  },
  "Bara haine cu prinderi": {
    "pret": 70,
    "um": "buc"
  },
  "Cos gunoi pe usa": {
    "pret": 53,
    "um": "buc"
  },
  "Sistem LED": {
    "pret": 350,
    "um": "buc"
  }
},
  geamuriOglinzi: {
  "Geam float 3mm": {
    "pretMp": 37
  },
  "Geam float 4mm": {
    "pretMp": 39
  },
  "Geam float 5mm": {
    "pretMp": 53
  },
  "Geam float 6mm": {
    "pretMp": 59
  },
  "Geam float 8mm": {
    "pretMp": 95
  },
  "Geam float 10mm": {
    "pretMp": 105
  },
  "Geam ultraclar 4mm": {
    "pretMp": 87
  },
  "Geam ultraclar 6mm": {
    "pretMp": 137
  },
  "Geam fumuriu 4mm": {
    "pretMp": 55
  },
  "Geam fumuriu 5mm": {
    "pretMp": 79
  },
  "Geam fumuriu 6mm": {
    "pretMp": 80
  },
  "Geam Lacobel": {
    "pretMp": 125
  },
  "Geam vopsit alb": {
    "pretMp": 135
  },
  "Geam ornament import": {
    "pretMp": 70
  },
  "Geam decorativ alb": {
    "pretMp": 100
  },
  "Geam decorativ fumuriu": {
    "pretMp": 105
  },
  "Geam reflexiv bronze": {
    "pretMp": 80
  },
  "Geam lowe 4mm": {
    "pretMp": 45
  },
  "Geam 4 anotimpuri": {
    "pretMp": 50
  },
  "Oglinda 3mm": {
    "pretMp": 54
  },
  "Oglinda 4mm": {
    "pretMp": 60
  },
  "Oglinda bronze 4mm": {
    "pretMp": 110
  },
  "Oglinda/geam montat": {
    "pretMp": 185
  }
},
};