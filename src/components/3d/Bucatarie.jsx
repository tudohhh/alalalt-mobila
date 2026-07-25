// src/Bucatarie.jsx — configurator BUCATARIE PE ML (modelul Cozma, v2.1)
// Acelasi stil vizual cu Configurator.jsx. Foloseste calculeazaBucatarie din calcul-v2.
import React, { useState, useMemo } from "react";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";
import { calculeazaBucatarie } from "../../utils/calcul.js";
import Formular from "../ui/Formular.jsx";

const eur=n=>Math.round(n).toLocaleString("ro-RO")+" €";
const lei=n=>Math.round(n).toLocaleString("ro-RO")+" lei";

const FORME = {
  dreapta: { nume:"Dreaptă (un perete)", segmente:1 },
  L:       { nume:"În L",                segmente:2 },
  U:       { nume:"În U",                segmente:3 },
};

export default function Bucatarie({ inapoi }){
  const [forma,setForma]=useState("dreapta");
  const [seg,setSeg]=useState([3.0, 2.0, 2.0]);   // ml per segment
  const [insula,setInsula]=useState(false);
  const [insulaMl,setInsulaMl]=useState(1.8);
  const [optSel,setOptSel]=useState([]);
  const [faza,setFaza]=useState("config");

  const nSeg=FORME[forma].segmente;
  const mlTotal=seg.slice(0,nSeg).reduce((s,v)=>s+v,0)+(insula?insulaMl:0);

  const deviz=useMemo(()=>calculeazaBucatarie({
    ml: mlTotal,
    optionale: optSel.map(nume=>({nume})),
  }),[mlTotal,optSel]);

  const toggleOpt=n=>setOptSel(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n]);
  const setSegVal=(i,v)=>setSeg(s=>s.map((x,j)=>j===i?v:x));

  const rezumat=`Bucătărie ${FORME[forma].nume}${insula?" + insulă":""} — ${mlTotal.toFixed(1)} ml total — standard MDF vopsit${optSel.length?` — opționale: ${optSel.join(", ")}`:""}`;

  if(faza==="formular") return (
    <div style={{minHeight:"100vh",background:"#f4f1ec",fontFamily:"system-ui,sans-serif",color:"#2a2622",padding:24}}>
      <Formular rezumat={rezumat} deviz={{linii:deviz.linii.map(l=>({desc:l.desc,cant:l.cant,um:l.um,total:l.totalEur*deviz.curs*(1+deviz.tva)})),cost:deviz.totalEurFaraTva*deviz.curs,total:deviz.totalLei}} poza={null} inapoi={()=>setFaza("config")}/>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f4f1ec",fontFamily:"system-ui,sans-serif",color:"#2a2622"}}>
      <div style={{maxWidth:980,margin:"0 auto",padding:"18px 18px 40px"}}>
        <button onClick={inapoi} style={{fontSize:13,color:"#a37e4a",background:"none",border:"none",cursor:"pointer",fontWeight:600,marginBottom:6}}>&larr; alt tip</button>
        <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 4px"}}>Bucătărie — configurator</h1>
        <p style={{fontSize:12.5,color:"#8a8378",margin:"0 0 14px"}}>Estimare pe metru liniar. Standardul include: {C.bucatarie.standardInclude}.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={card}>
              <Sec>Forma bucătăriei</Sec>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                {Object.entries(FORME).map(([k,f])=>(
                  <button key={k} onClick={()=>setForma(k)} style={{padding:"10px 4px",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600,border:forma===k?"2px solid #a37e4a":"1px solid #e3ded5",background:forma===k?"#faf6ef":"#fff",color:"#2a2622"}}>{f.nume}</button>
                ))}
              </div>
              <Sec>Dimensiuni (metri liniari pe fiecare perete)</Sec>
              {Array.from({length:nSeg}).map((_,i)=>(
                <Sl key={i} label={`Perete ${i+1}`} v={seg[i]} set={v=>setSegVal(i,v)} min={1} max={6} step={0.1}/>
              ))}
              <label style={{display:"flex",gap:8,fontSize:13,margin:"8px 0",cursor:"pointer",alignItems:"center"}}>
                <input type="checkbox" checked={insula} onChange={e=>setInsula(e.target.checked)}/>Cu insulă
              </label>
              {insula && <Sl label="Insulă" v={insulaMl} set={setInsulaMl} min={1} max={4} step={0.1}/>}
            </div>
            <div style={card}>
              <Sec>Opționale (peste standard)</Sec>
              {Object.entries(C.bucatarie.optionale).map(([nume,o])=>(
                <label key={nume} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",cursor:"pointer",fontSize:12.5,borderBottom:"1px solid #f4f1ec"}}>
                  <input type="checkbox" checked={optSel.includes(nume)} onChange={()=>toggleOpt(nume)}/>
                  <span style={{flex:1}}>{nume}</span>
                  <span style={{fontSize:11,color:"#8a8378"}}>{o.pretMlEur?`${o.pretMlEur} €/ml`:`${o.pretBucEur} €/buc`}</span>
                </label>
              ))}
              <div style={{fontSize:11,color:"#a8a29e",marginTop:8}}>Accesorii speciale, coloane, alte configurații — la discuția de ofertă.</div>
            </div>
          </div>
          <div style={{...card,position:"sticky",top:16,alignSelf:"start"}}>
            <Sec>Estimare</Sec>
            <div style={{fontSize:12,color:"#8a8378",marginBottom:8}}>{FORME[forma].nume}{insula?" + insulă":""} — {mlTotal.toFixed(1)} ml</div>
            <table style={{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:10}}>
              <tbody>{deviz.linii.map((l,i)=>(
                <tr key={i} style={{borderTop:"1px solid #f0ece5"}}>
                  <td style={{padding:"4px 0"}}>{i===0?"Bucătărie standard":l.desc}</td>
                  <td style={{textAlign:"right",color:"#8a8378"}}>{l.cant.toFixed?l.cant.toFixed(1):l.cant} {l.um}</td>
                  <td style={{textAlign:"right"}}>{eur(l.totalEur)}</td>
                </tr>))}</tbody>
            </table>
            <div style={{borderTop:"2px solid #e3ded5",paddingTop:8}}>
              <Row k="Total fără TVA" v={eur(deviz.totalEurFaraTva)}/>
              <Row k={`TVA ${Math.round(deviz.tva*100)}%`} v={eur(deviz.totalEur-deviz.totalEurFaraTva)}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:18,fontWeight:800}}>
                <span>Total</span><span style={{color:"#a37e4a"}}>{eur(deviz.totalEur)}</span>
              </div>
              <div style={{textAlign:"right",fontSize:12.5,color:"#8a8378"}}>≈ {lei(deviz.totalLei)}</div>
              <div style={{fontSize:11,color:"#a8a29e",margin:"8px 0 10px"}}>Estimare inițială. Oferta finală se stabilește după măsurători și proiectare, împreună cu echipa noastră.</div>
            </div>
            <button onClick={()=>setFaza("formular")} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"#a37e4a",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Solicită ofertă</button>
          </div>
        </div>
      </div>
    </div>
  );
}
const card={background:"#fff",borderRadius:16,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",height:"fit-content"};
const Sec=({children})=><div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#a37e4a",margin:"12px 0 8px"}}>{children}</div>;
const btn={width:30,height:30,borderRadius:7,border:"none",background:"#efe9e0",color:"#2a2622",fontSize:16,cursor:"pointer"};
function Sl({label,v,set,min,max,step}){return(<div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12.5,fontWeight:600}}>{label}</span><span style={{fontSize:12.5,color:"#8a8378"}}>{v.toFixed(1)} m</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><button onClick={()=>set(Math.max(min,+(v-step).toFixed(1)))} style={btn}>-</button><input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(Number(e.target.value))} style={{flex:1,accentColor:"#a37e4a"}}/><button onClick={()=>set(Math.min(max,+(v+step).toFixed(1)))} style={btn}>+</button></div></div>);}
const Row=({k,v})=><div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#57534e",marginBottom:3}}><span>{k}</span><span>{v}</span></div>;
