// src/calcul-v2.js — MOTOR v2.1, reguli validate cu Cozma (18.07.2026)
// PRET = suma(cant x pretUnitar) x adaosGlobal(2.5 estimare) 
// Reguli: pierderi 10% pe placi; cant18 pe TOTI mp placi; carcasa mereu
// PAL structura; fronturi la pretul materialului ales; Diverse = 1% costuri;
// balamale = round(H_usa/500) min 2, per usa; polite in geometrie.
import { CONFIG_TAMPLAR as C } from "../config-tamplar/CONFIG-v2.1.js";

const adaos = () => C.adaosGlobal;

export function nrBalamalePerUsa(usaH_mm){ return Math.max(2, Math.round(usaH_mm/500)); }

export function cantAccesoriu(regula, ctx){
  switch(regula){
    case "perUsa": return ctx.nUsi;
    case "perBalama": return ctx.nUsi * nrBalamalePerUsa(ctx.usaH);
    case "perSertar": return ctx.nSertare;
    case "perFront": return ctx.nUsi + ctx.nSertare;
    case "perCorp": return ctx.turnuri;
    case "perMlLatime": return ctx.latime/1000;
    case "fix": return 1;
    default: return 1;
  }
}
export const umRegula = r => r==="perMlLatime" ? "ml" : "buc";
function gasesteAccesoriu(nume){ for(const cat of Object.values(C.accesoriiCategorii)) if(cat[nume]) return cat[nume]; return null; }

export function calculeaza(cfg, tip){
  const T=C.tipuri[tip], model=C.modeleLayout[cfg.model];
  const { latime,inaltime,adancime,turnuri,materialExt,blat,suprapus,accesoriiSel }=cfg;
  const sertarePerTurn=model.sertarePerTurn;
  const t=C.grosimi.PAL, mp=(w,h)=>(w*h)/1e6, PIERD=C.pierderi;
  const nT=Math.max(1,turnuri), montanti=nT-1;
  const latTurn=(latime-(nT+1)*t)/nT;
  const nSertare=nT*sertarePerTurn, nUsi=model.deschis?0:nT;

  const hCorp=inaltime*(suprapus?0.7:1);
  const nPolite=(model.politePerTurn??3)*nT;
  const mpCarcasa=2*mp(hCorp,adancime)+2*mp(latime-2*t,adancime)+montanti*mp(hCorp-2*t,adancime)+nPolite*mp(latTurn,adancime);
  const mpSpate=mp(latime,hCorp);
  const sertZ=sertarePerTurn>0?Math.min(hCorp*0.3,450):0;
  const usaH=hCorp-t-sertZ-t;
  const mpUsi=nUsi*mp(latTurn,usaH);
  const mpSert=nSertare*mp(latTurn,sertZ/Math.max(1,sertarePerTurn));
  const hSup=suprapus?inaltime*0.3:0;
  const mpSuprapus=suprapus?(2*mp(hSup,adancime)+2*mp(latime-2*t,adancime)+nT*mp(latTurn,hSup-2*t)):0;

  const matE=C.materialeCorp[materialExt]||{};
  const pFronturi=matE.pretMp??C.pretStructuraPal;
  const pStr=C.pretStructuraPal;
  const cant18=C.consumabile.cantABS18.pret, pflP=C.consumabile.PFL.pret;

  const linie=(desc,cant,um,pretU)=>({desc,cant,um,cost:cant*pretU,adaos:adaos(),total:cant*pretU*adaos()});

  // v2.1: carcasa (+suprapus) mereu la pret PAL structura, cu pierderi 10%
  const cantCarcasa=(mpCarcasa+mpSuprapus)*PIERD;
  const cantFronturi=(mpUsi+mpSert)*PIERD;
  const linii=[
    linie("Structura PAL melaminat", cantCarcasa, "mp", pStr),
    ...(cantFronturi>0?[linie(`Fronturi ${materialExt}`, cantFronturi, "mp", pFronturi)]:[]),
    linie("Spate PFL", mpSpate, "mp", pflP),
    // v2.1: cant ABS pe TOTI mp de placi
    linie("Cant ABS 18mm", cantCarcasa+cantFronturi, "mp", cant18),
  ];

  // 3.1: cant ABS 36 pe perimetrul fronturilor cand materialul e clasa MDF
  if((matE.clasa||"").startsWith("mdf") && (nUsi+nSertare)>0){
    const shF=sertZ/Math.max(1,sertarePerTurn);
    const perimetruMl=(nUsi*2*(latTurn+usaH)+nSertare*2*(latTurn+shF))/1000;
    linii.push(linie("Cant ABS 36mm (fronturi MDF)", perimetruMl, "ml", C.consumabile.cantABS36.pret));
  }
  // 3.2: funduri sertar PFL (latTurn x adancime), cu pierderi pe placi
  if(nSertare>0){
    linii.push(linie("Funduri sertar PFL", nSertare*mp(latTurn,adancime)*PIERD, "mp", pflP));
  }

  if (T.blat && blat && blat!=="Fără blat") {
    const b=C.blaturi[blat];
    if (b.pretMl>0) linii.push(linie(`Blat ${blat}`, latime/1000, "ml", b.pretMl));
  }

  const ctx={ turnuri:nT, nUsi, nSertare, latime, usaH };
  (accesoriiSel||[]).forEach(nume=>{
    const a=gasesteAccesoriu(nume); if(!a)return;
    const c=cantAccesoriu(a.regula,ctx);
    if(c>0){ const l=linie(`${nume} (${a.prod})`, c, umRegula(a.regula), a.pret); l.acc=true; linii.push(l); }
  });

  // v2.1: Diverse = 1% din costuri (dibluri, suruburi, maruntisuri)
  const costPartial=linii.reduce((s,l)=>s+l.cost,0);
  linii.push(linie("Diverse (consumabile marunte)", 1, "buc", costPartial*C.diverseProcent));

  const cost=linii.reduce((s,l)=>s+l.cost,0);
  const total=linii.reduce((s,l)=>s+l.total,0);
  return { linii, cost, total, adaosMediu:adaos(), nSertare, nUsi };
}

// v2.1: BUCATARIE PE ML — modelul lui Cozma (1200 EUR+TVA/ml standard)
export function calculeazaBucatarie({ ml, optionale=[] }){
  const B=C.bucatarie, curs=C.cursEur;
  const linii=[{ desc:`Bucatarie standard (${B.standardInclude})`, cant:ml, um:"ml",
                 totalEur: ml*B.pretMlStandardEur }];
  optionale.forEach(o=>{
    const opt=B.optionale[o.nume]; if(!opt) return;
    const totalEur = opt.pretMlEur ? (o.ml??ml)*opt.pretMlEur : (o.buc??1)*opt.pretBucEur;
    linii.push({ desc:o.nume, cant:opt.pretMlEur?(o.ml??ml):(o.buc??1), um:opt.pretMlEur?"ml":"buc", totalEur });
  });
  const totalEurFaraTva=linii.reduce((s,l)=>s+l.totalEur,0);
  const totalEur=totalEurFaraTva*(1+C.tva);
  return { linii, totalEurFaraTva, totalEur, totalLei: totalEur*curs, curs, tva:C.tva };
}
