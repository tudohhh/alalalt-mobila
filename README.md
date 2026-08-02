# Configurator Mobilă 3D

Configurator web pentru mobilă la comandă: clientul setează corpuri, materiale,
uși/sertare, blat — vede modelul 3D în timp real și primește devizul automat.

## Stack
React + Vite + Three.js (geometrie proprie, materiale PBR de lemn).

## Rulare
```bash
npm install
npm start      # dev
npm run build  # producție → dist/
```

## Structura (lanțul viu)
```
src/main.jsx
  └─ components/ui/Configurator.jsx   → UI: panouri, opțiuni, preț live
       ├─ utils/calcul.js            → motor deviz (cantități + preț)
       ├─ components/3d/Scena3D.jsx  → randare 3D mobilă (corpuri, uși,
       │                               sertare, vitrine, blat) + materiale PBR
       ├─ components/ui/Formular.jsx → formular cerere ofertă
       └─ components/3d/Bucatarie.jsx→ layout bucătărie

src/config/CONFIG.js  → date business (materiale, prețuri, dimensiuni)
```

**Unde schimbi ce:**
- preț/material → `config/CONFIG.js`
- calcul deviz → `utils/calcul.js`
- cum arată mobila în 3D → `components/3d/Scena3D.jsx`
- interfața → `components/ui/Configurator.jsx`

## Materiale
Scena3D folosește materiale PBR de lemn (`woodPBR`): fiecare decor are hartă de
culoare, rugozitate și normal map generate procedural, plus un environment map
de interior (cu reflexii subtile) care dă viață suprafețelor.
