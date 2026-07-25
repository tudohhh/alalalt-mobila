// ============================================================
//  CONFIG_TAMPLAR v2.1 — reguli FINALE validate cu Cozma (18.07.2026)
//  Surse: calcul_pret_2_5.xlsx + calcul_pret_-_Alexandru_Popescu.xlsx
//         + raspunsuri Cozma 18.07 (vezi RASPUNSURI-COZMA-REGULI-FINALE.txt)
//  REGULI v2.1:
//   - adaosGlobal 2.5 = ESTIMARE INITIALA (complexitatea o ajusteaza Cozma)
//   - PAL structura 84 lei/mp, pierderi 10% facturate (cant = mp x 1.10)
//   - cant ABS 18 pe TOTI mp de placi
//   - Diverse = 1% din costuri (dibluri, suruburi)
//   - balamale = round(H_usa/500), min 2; Hafele 6 / Blum 12 lei
//   - MDF 370, ROKO 180, Front riflat 300, Oglinda montata 185
//   - BUCATARIE PE ML: 1200 EUR+TVA/ml standard + optionale
//   - polite in geometrie (politePerTurn pe layout)
// ============================================================
export const CONFIG_TAMPLAR = {
  afisarePret: true,
  modAdaos: "global",
  adaosGlobal: 2.5,             // v2.1: estimare initiala (Cozma ajusteaza personal la final)
  pierderi: 1.10,                // +10% pierderi facturate pe placi
  diverseProcent: 0.01,          // v2.1: Diverse = 1% din costuri (dibluri, suruburi)
  balamaPer50cm: true,           // v2.1: nr balamale = round(H_usa/500), min 2
  cursEur: 5.05,                 // curs orientativ EUR->RON (de actualizat)
  tva: 0.21,                     // TVA standard RO
  grosimi: { PAL: 18, PFL: 3 },
  layout: { fractieSusJos: 0.62 },

  // pastrate pentru compatibilitate cu modAdaos="perMaterial"
  adaosuri: {
    "pal": 2.2, "mdf_vopsit": 2.2, "mdf_infoliat": 2.2,
    "lemn": 2.2, "glisare_dressing": 2.2, "accesorii": 2.2,
  },

  // MATERIALE — pret/mp REAL din oferta Popescu
  materialeCorp: {
    "PAL melaminat":      { hex:"#c9a36a", tex:["#c9a36a","#7a5a2e"], pretMp:84,  clasa:"pal" },
    "PAL uni":            { hex:"#d8c9b0", tex:null, pretMp:45,  clasa:"pal" },
    "PAL lucios":         { hex:"#ececea", tex:null, pretMp:95,  clasa:"pal" },
    "PAL economic":       { hex:"#bdbdb5", tex:null, pretMp:29,  clasa:"pal" },
    "MDF":                { hex:"#7d8a6f", tex:null, pretMp:370, clasa:"mdf_vopsit" },
    "MDF infoliat mat":   { hex:"#e8e4dd", tex:null, pretMp:200, clasa:"mdf_infoliat" },
    "MDF infoliat lucios":{ hex:"#f0ece5", tex:null, pretMp:255, clasa:"mdf_infoliat" },
    "MDF frezat":         { hex:"#d8c9b0", tex:null, pretMp:405, clasa:"mdf_vopsit" },
    "ROKO (riflaj)":      { hex:"#b89b6e", tex:null, pretMp:180, clasa:"pal" },
    "Front riflat":       { hex:"#a8895c", tex:null, pretMp:300, clasa:"pal" },
  },
  // carcasa se factureaza mereu ca PAL structura (84)
  pretStructuraPal: 84,

  consumabile: {
    cantABS18: { pret:25, um:"mp" },   // pe TOTI mp de placi
    cantABS36: { pret:35, um:"ml" },
    PFL:       { pret:20, um:"mp" },
  },
  blaturi: {
    "Fără blat":            { pretMl:0,   hex:null,      clasa:"pal" },
    "Blat termorezistent":  { pretMl:0,   hex:"#8a8078", clasa:"pal" },
    "Blat HPL compact":     { pretMl:180, hex:"#2e2e2e", clasa:"pal" },
    "Blat quartz":          { pretMl:320, hex:"#d8d5cf", clasa:"pal" },
  },

  // FERONERIE — preturi reale + reguli Cozma
  feronerie: {
    "Balama Hafele":                 { pret:6,    um:"buc" },   // v2.1: per producator
    "Balama Blum":                   { pret:12,   um:"buc" },   // v2.1
    "Sistem push to open":           { pret:16,   um:"buc" },
    "Glisiera normala":              { pret:16.3, um:"set" },
    "Glisiera tandem GTV D500":      { pret:50,   um:"set" },
    "Glisiera tandem Blum tip-on D500": { pret:71, um:"set" },
    "Cos jolly amortizat Blum 150":  { pret:350,  um:"buc" },
    "Cos jolly tip-on Blum 150":     { pret:153,  um:"buc" },
    "Maner standard":                { pret:12,   um:"buc" },
    "Maner profil negru":            { pret:50,   um:"buc" },
    "Maner frezat MDF":              { pret:40,   um:"ml" },
    "Riflaj MDF negru in cant":      { pret:500,  um:"ml" },
    "Picioare reglabile H120":       { pret:5,    um:"buc" },
    "Plinta":                        { pret:120,  um:"buc" },
    "Picurator 900":                 { pret:150,  um:"buc" },
    "Piston ridicare 100N":          { pret:12.4, um:"buc" },
    "Aventos HK-XS":                 { pret:70,   um:"buc" },
    "Sistem coborare usa":           { pret:25,   um:"buc" },
    "Bara haine cu prinderi":        { pret:70,   um:"buc" },
    "Cos gunoi pe usa":              { pret:53,   um:"buc" },
    "Sistem LED":                    { pret:350,  um:"buc" },
  },

  // // eliminatURI & OGLINZI — lista Krypton completa
  // eliminaturiOglinzi: {
    "// eliminat float 3mm":       { pretMp:37 },
    "// eliminat float 4mm":       { pretMp:39 },
    "// eliminat float 5mm":       { pretMp:53 },
    "// eliminat float 6mm":       { pretMp:59 },
    "// eliminat float 8mm":       { pretMp:95 },
    "// eliminat float 10mm":      { pretMp:105 },
    "// eliminat ultraclar 4mm":   { pretMp:87 },
    "// eliminat ultraclar 6mm":   { pretMp:137 },
    "// eliminat fumuriu 4mm":     { pretMp:55 },
    "// eliminat fumuriu 5mm":     { pretMp:79 },
    "// eliminat fumuriu 6mm":     { pretMp:80 },
    "// eliminat Lacobel":         { pretMp:125 },
    "// eliminat vopsit alb":      { pretMp:135 },
    "// eliminat ornament import": { pretMp:70 },
    "// eliminat decorativ alb":   { pretMp:100 },
    "// eliminat decorativ fumuriu":{ pretMp:105 },
    "// eliminat reflexiv bronze": { pretMp:80 },
    "// eliminat lowe 4mm":        { pretMp:45 },
    "// eliminat 4 anotimpuri":    { pretMp:50 },
    "Oglinda 3mm":          { pretMp:54 },
    "Oglinda 4mm":          { pretMp:60 },
    "Oglinda bronze 4mm":   { pretMp:110 },
    "Oglinda/// eliminat montat":  { pretMp:185 },
  },

  accesoriiCategorii: {
    "Balamale & amortizare": {
      "Balama Hafele":        { prod:"Hafele", pret:6,   regula:"perBalama" },
      "Balama Blum":          { prod:"Blum",   pret:12,  regula:"perBalama" },
      "Push to open":         { prod:"std",    pret:16,  regula:"perUsa" },
    },
    "Glisiere sertar": {
      "Glisiera normala":         { prod:"std",  pret:16.3, regula:"perSertar" },
      "Tandem GTV D500":          { prod:"GTV",  pret:50,   regula:"perSertar" },
      "Tandem Blum tip-on D500":  { prod:"Blum", pret:71,   regula:"perSertar" },
    },
    "Cosuri & organizare": {
      "Cos jolly amortizat Blum": { prod:"Blum", pret:350, regula:"fix" },
      "Cos jolly tip-on Blum":    { prod:"Blum", pret:153, regula:"fix" },
      "Cos gunoi pe usa":         { prod:"std",  pret:53,  regula:"fix" },
      "Bara haine cu prinderi":   { prod:"std",  pret:70,  regula:"perCorp" },
    },
    "Iluminat LED": {
      "Sistem LED":               { prod:"std", pret:350, regula:"fix" },
    },
    "Manere & sisteme": {
      "Maner standard":       { prod:"std", pret:12, regula:"perFront" },
      "Maner profil negru":   { prod:"std", pret:50, regula:"perFront" },
      "Maner frezat MDF":     { prod:"std", pret:40, regula:"perMlLatime" },
      "Aventos HK-XS":        { prod:"Blum",pret:70, regula:"perUsa" },
    },
    "Picioare & plinte": {
      "Picioare reglabile H120": { prod:"std", pret:5,   regula:"perCorp" },
      "Plinta":                  { prod:"std", pret:120, regula:"fix" },
      "Piston ridicare 100N":    { prod:"std", pret:12.4,regula:"perUsa" },
    },
  },

  // v2.1: BUCATARIE PE ML — modelul simplu al lui Cozma
  bucatarie: {
    pretMlStandardEur: 1200,     // EUR + TVA / ml
    standardInclude: "blat+contrablat termo 38/10mm, fronturi MDF vopsit drept 1 fata, 4 sertare, balamale soft-close, sertare metalice soft-close, jolly premium, scurgator inox, sertar tacamuri, orice depozitare",
    optionale: {
      "Blat HPL compact":   { pretMlEur: 150 },   // orientativ, de validat cu Cozma
      "Blat piatra":        { pretMlEur: 350 },   // orientativ, de validat
      "Coloana electrocasnice": { pretBucEur: 250 }, // orientativ, de validat
      "Iluminat LED":       { pretBucEur: 80 },   // orientativ, de validat
    },
  },

  modeleLayout: {
    "tot_usi":     { nume:"Tot uși",           sertarePerTurn:0, politePerTurn:4, vitrina:false, deschis:false },
    "usi_sertare": { nume:"Uși + sertare jos", sertarePerTurn:2, politePerTurn:3, vitrina:false, deschis:false },
    "cu_vitrina":  { nume:"Cu vitrină",        sertarePerTurn:1, politePerTurn:3, vitrina:true,  deschis:false },
    "deschis":     { nume:"Rafturi deschise",  sertarePerTurn:0, politePerTurn:5, vitrina:false, deschis:true },
  },

  tipuri: {
    dulap:  { nume:"Dulap", suspendabil:false, suprapozabil:true, blat:false, maxTurnuri:4,
              limite:{ latime:{min:600,max:2400,pas:50}, inaltime:{min:1400,max:2450,pas:50}, adancime:{min:400,max:650,pas:50} },
              default:{ latime:1500, inaltime:2000, adancime:600, turnuri:3, model:"usi_sertare" } },
    dressing:{ nume:"Dressing", suspendabil:false, suprapozabil:true, blat:false, maxTurnuri:6,
              limite:{ latime:{min:1000,max:3600,pas:50}, inaltime:{min:1800,max:2600,pas:50}, adancime:{min:400,max:650,pas:50} },
              default:{ latime:2400, inaltime:2200, adancime:600, turnuri:3, model:"usi_sertare" } },
    comoda: { nume:"Comodă", suspendabil:true, suprapozabil:false, blat:true, maxTurnuri:3,
              limite:{ latime:{min:400,max:1600,pas:50}, inaltime:{min:400,max:1200,pas:50}, adancime:{min:300,max:550,pas:50} },
              default:{ latime:1000, inaltime:700, adancime:450, turnuri:2, model:"usi_sertare" } },
    baie:   { nume:"Dulap baie", suspendabil:true, suprapozabil:false, blat:true, maxTurnuri:2,
              limite:{ latime:{min:400,max:1200,pas:50}, inaltime:{min:400,max:900,pas:50}, adancime:{min:250,max:500,pas:50} },
              default:{ latime:600, inaltime:550, adancime:450, turnuri:1, model:"usi_sertare" } },
  },
  livrare: { termenEstimativ:"50 zile lucrătoare", zone:["Neamț","Iași","Bacău","Suceava","Altă zonă (cu transport)"] },
  pachete: { eco:{nume:"Economic"}, standard:{nume:"Standard"}, premium:{nume:"Premium"} },
};
