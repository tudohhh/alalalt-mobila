// src/Configurator.jsx — UI "showroom": scena 3D erou full-screen,
// panouri plutitoare cu blur, mostre de material, pret animat, tipografie
// Fraunces, deviz pliabil, tranzitii intre faze.
// Foloseste: CONFIG-v2.1.js, calcul-v2.js, Scena3D.jsx, Formular.jsx, Bucatarie.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";
import { calculeaza, umRegula } from "../../utils/calcul.js";
import Scena3D from "../3d/Scena3D.jsx";
import Formular from "../ui/Formular.jsx";
import Bucatarie from "../3d/Bucatarie.jsx";

// ——— tipografie: Fraunces pentru display, injectat o singura data ———
(function fonturi(){
  if(document.getElementById("font-fraunces"))return;
  const l=document.createElement("link");l.id="font-fraunces";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&display=swap";
  document.head.appendChild(l);
  const s=document.createElement("style");s.textContent=`
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fz-panel{animation:fadeUp .45s cubic-bezier(.2,.8,.2,1) both}
    .fz-in{animation:fadeIn .5s ease both}
    .fz-linie{animation:fadeUp .3s ease both}
  `;document.head.appendChild(s);
})();

const DISPLAY="'Fraunces',Georgia,serif";
const lei=n=>Math.round(n).toLocaleString("ro-RO")+" lei";
const num=(n,d=2)=>n.toLocaleString("ro-RO",{minimumFractionDigits:d,maximumFractionDigits:d});

// ——— pret animat: cifra se rostogoleste spre valoarea noua ———
function usePretAnimat(valoare){
  const [afisat,setAfisat]=useState(valoare);
  const ref=useRef(valoare);
  useEffect(()=>{
    const start=ref.current,delta=valoare-start;
    if(Math.abs(delta)<1){setAfisat(valoare);ref.current=valoare;return;}
    const t0=performance.now(),dur=340;let raf;
    const pas=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
      const v=start+delta*e;setAfisat(v);ref.current=v;
      if(p<1)raf=requestAnimationFrame(pas);};
    raf=requestAnimationFrame(pas);
    return()=>cancelAnimationFrame(raf);
  },[valoare]);
  return afisat;
}

// ——— ilustratii minimale SVG pentru selector ———
const Icon=({tip})=>{
  const s={dulap:<g><rect x="8" y="6" width="32" height="40" rx="2"/><line x1="24" y1="6" x2="24" y2="46"/><circle cx="20.5" cy="26" r="1.3"/><circle cx="27.5" cy="26" r="1.3"/></g>,
    dressing:<g><rect x="4" y="6" width="40" height="40" rx="2"/><line x1="17" y1="6" x2="17" y2="46"/><line x1="31" y1="6" x2="31" y2="46"/><line x1="4" y1="34" x2="44" y2="34"/></g>,
    comoda:<g><rect x="6" y="16" width="36" height="26" rx="2"/><line x1="6" y1="25" x2="42" y2="25"/><line x1="6" y1="34" x2="42" y2="34"/><line x1="20" y1="20.5" x2="28" y2="20.5"/><line x1="20" y1="29.5" x2="28" y2="29.5"/><line x1="20" y1="38.5" x2="28" y2="38.5"/></g>,
    baie:<g><rect x="10" y="14" width="28" height="24" rx="2"/><line x1="24" y1="14" x2="24" y2="38"/><ellipse cx="24" cy="10" rx="10" ry="3"/></g>,
    bucatarie:<g><rect x="4" y="24" width="40" height="18" rx="2"/><line x1="16" y1="24" x2="16" y2="42"/><line x1="32" y1="24" x2="32" y2="42"/><rect x="4" y="20" width="40" height="4" rx="1"/><rect x="10" y="6" width="12" height="10" rx="1"/></g>};
  return <svg width="48" height="52" viewBox="0 0 48 52" fill="none" stroke="#a37e4a" strokeWidth="2" strokeLinecap="round">{s[tip]||s.dulap}</svg>;
};

export default function Configurator(){
  const [tip,setTip]=useState(null);
  if(!tip) return <Selector onPick={setTip}/>;
  if(tip==="bucatarie") return <Bucatarie inapoi={()=>setTip(null)}/>;
  return <Config tip={tip} inapoi={()=>setTip(null)}/>;
}

function Selector({onPick}){
  const optiuni=[...Object.entries(C.tipuri).map(([k,t])=>({k,nume:t.nume,sub:"configurare liberă"})),
    {k:"bucatarie",nume:"Bucătărie",sub:"estimare pe metru liniar"}];
  return (
    <div className="fz-in" style={{minHeight:"100vh",background:"#f4f1ec",fontFamily:"system-ui,sans-serif",color:"#2a2622",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:"#a37e4a",fontWeight:700}}>Atelier mobilă</div>
      <h1 style={{fontFamily:DISPLAY,fontSize:44,fontWeight:700,margin:"10px 0 6px",letterSpacing:-.5}}>Mobila ta, pe măsura ta.</h1>
      <p style={{color:"#8a8378",marginBottom:34,fontSize:15}}>Alege tipul, configurează în 3D, vezi prețul pe loc.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,168px)",gap:14,justifyContent:"center",maxWidth:960}}>
        {optiuni.map((o,i)=>(
          <button key={o.k} onClick={()=>onPick(o.k)} className="fz-panel" style={{animationDelay:`${i*60}ms`,background:"#fff",border:"1px solid #e7e5e4",borderRadius:18,padding:"24px 12px 18px",cursor:"pointer",boxShadow:"0 2px 10px rgba(40,30,20,.06)",transition:"transform .18s,box-shadow .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 10px 26px rgba(40,30,20,.13)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 10px rgba(40,30,20,.06)";}}>
            <Icon tip={o.k}/>
            <div style={{marginTop:12,fontWeight:700,fontSize:15}}>{o.nume}</div>
            <div style={{fontSize:11,color:"#a8a29e",marginTop:3}}>{o.sub}</div>
          </button>))}
      </div>
    </div>
  );
}

function Config({tip,inapoi}){
  const T=C.tipuri[tip],L=T.limite,d=T.default;
  const [latime,setLatime]=useState(d.latime);
  const [inaltime,setInaltime]=useState(d.inaltime);
  const [adancime,setAdancime]=useState(d.adancime);
  const [turnuri,setTurnuri]=useState(d.turnuri);
  const [model,setModel]=useState(d.model);
  const [materialExt,setMaterialExt]=useState("PAL melaminat");
  const [materialFront,setMaterialFront]=useState(null); // null = la fel ca corpul
  const [tipManer,setTipManer]=useState("Bară neagră");
  const [compartimente,setCompartimente]=useState(null); // null = layout global; array = per compartiment
  const [blat,setBlat]=useState("Fără blat");
  const [suspendat,setSuspendat]=useState(false);
  const [suprapus,setSuprapus]=useState(false);
  const [accesoriiSel,setAccesoriiSel]=useState([]);
  const [openCat,setOpenCat]=useState(null);
  const [detalii,setDetalii]=useState(false);
  const [faza,setFaza]=useState("config");
  const [poza,setPoza]=useState(null);
  const capRef=useRef(null);

  const cfg={latime,inaltime,adancime,turnuri,model,materialExt,materialFront,tipManer,compartimente,blat,suspendat,suprapus,accesoriiSel};
  const deviz=useMemo(()=>calculeaza(cfg,tip),[latime,inaltime,adancime,turnuri,model,materialExt,materialFront,tipManer,compartimente,blat,suspendat,suprapus,accesoriiSel,tip]);
  const pretA=usePretAnimat(deviz.total);
  const toggleAcc=n=>setAccesoriiSel(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n]);
  const rezumat=`${T.nume} — ${latime}x${inaltime}x${adancime} mm — ${C.modeleLayout[model].nume} — ${turnuri} turnuri — ${materialExt}${suprapus?" — supantă":""}${suspendat?" — suspendat":""}${blat!=="Fără blat"?` — blat ${blat}`:""}${accesoriiSel.length?` — ${accesoriiSel.length} accesorii`:""}`;
  const spreFormular=()=>{setPoza(capRef.current?capRef.current():null);setFaza("formular");};

  if(faza==="formular") return (
    <div className="fz-in" style={{minHeight:"100vh",background:"#f4f1ec",fontFamily:"system-ui,sans-serif",color:"#2a2622",padding:24}}>
      <Formular rezumat={rezumat} deviz={deviz} poza={poza} inapoi={()=>setFaza("config")}/>
    </div>
  );

  return (
    <div style={{position:"relative",width:"100vw",height:"100vh",overflow:"hidden",fontFamily:"system-ui,sans-serif",color:"#2a2622",background:"#efeae2"}}>
      {/* SCENA — eroul, pe tot ecranul */}
      <div style={{position:"absolute",inset:0}}>
        <Scena3D cfg={cfg} tip={tip} onReady={fn=>(capRef.current=fn)}/>
      </div>

      {/* HEADER plutitor */}
      <div className="fz-panel" style={{position:"absolute",top:16,left:18,display:"flex",alignItems:"center",gap:14}}>
        <button onClick={inapoi} style={{...pill,fontWeight:600}}>&larr; alt tip</button>
        <div style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,textShadow:"0 1px 0 rgba(255,255,255,.6)"}}>{T.nume}</div>
      </div>

      {/* PANOU CONTROALE — stanga, plutitor */}
      <div className="fz-panel" style={{...panou,left:18,top:64,bottom:16,width:272,overflowY:"auto",animationDelay:"80ms"}}>
        <Sec>Model</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:4}}>
          {Object.entries(C.modeleLayout).map(([k,m])=>(
            <button key={k} onClick={()=>setModel(k)} style={{padding:"8px 4px",borderRadius:9,cursor:"pointer",fontSize:11.5,fontWeight:600,border:model===k?"2px solid #a37e4a":"1px solid #e3ded5",background:model===k?"#faf6ef":"#fff",color:"#2a2622"}}>{m.nume}</button>))}
        </div>
        <Sec>Dimensiuni</Sec>
        <Sl label="Lățime" v={latime} set={setLatime} min={L.latime.min} max={L.latime.max} step={L.latime.pas}/>
        <Sl label="Înălțime" v={inaltime} set={setInaltime} min={L.inaltime.min} max={L.inaltime.max} step={L.inaltime.pas}/>
        <Sl label="Adâncime" v={adancime} set={setAdancime} min={L.adancime.min} max={L.adancime.max} step={L.adancime.pas}/>
        <div style={{fontSize:11,color:"#8a8378",margin:"2px 0 6px",lineHeight:1.4}}>
          {(()=>{ const lm=T.latimeMaximaCorp||C.latimeMaximaCorp||900; const nc=Math.max(1,Math.ceil(latime/lm));
            return nc>1 ? `≈ ${nc} corpuri (peste ${lm/10} cm/corp se împarte — cum se produce real)` : "1 corp"; })()}
        </div>
        <Sl label="Turnuri" v={turnuri} set={setTurnuri} min={1} max={T.maxTurnuri} step={1} unit=""/>

        <Sec>Compartimente</Sec>
        {!compartimente ? (
          <button onClick={()=>setCompartimente(Array.from({length:turnuri},()=>"usi"))}
            style={{width:"100%",padding:"9px",borderRadius:9,cursor:"pointer",fontSize:11.5,fontWeight:600,
              background:"#fff",color:"#3a3630",border:"1px dashed #a37e4a",marginBottom:6}}>
            ✎ Compune fiecare compartiment
          </button>
        ) : (
          <div style={{marginBottom:6}}>
            {Array.from({length:turnuri}).map((_,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                <span style={{fontSize:11,color:"#8a8378",width:16}}>{i+1}</span>
                <div style={{display:"flex",gap:3,flex:1}}>
                  {[["usi","Uși"],["usi_sertare","Uși+sert"],["sertare","Sertare"],["deschis","Deschis"],["bara","Bară haine"],["rafturi","Rafturi"],["pantaloni","Pantaloni"],["cos","Coș rufe"],["vitrina","Vitrină"]].map(([k,lbl])=>{
                    const cur=(compartimente[i]||"usi")===k;
                    return <button key={k} onClick={()=>{const c=[...compartimente];c[i]=k;setCompartimente(c);}}
                      style={{flex:1,padding:"5px 2px",borderRadius:7,cursor:"pointer",fontSize:9.5,fontWeight:600,
                        background:cur?"#a37e4a":"#fff",color:cur?"#fff":"#5a544a",
                        border:cur?"1px solid #a37e4a":"1px solid #d8d2c6"}}>{lbl}</button>;
                  })}
                </div>
              </div>
            ))}
            <button onClick={()=>setCompartimente(null)}
              style={{fontSize:10.5,color:"#a37e4a",background:"none",border:"none",cursor:"pointer",padding:"2px 0"}}>
              ↺ înapoi la model predefinit
            </button>
          </div>
        )}
        {(T.suspendabil||T.suprapozabil)&&<Sec>Structură</Sec>}
        {T.suspendabil&&<Check label="Suspendat (pe perete)" v={suspendat} set={setSuspendat}/>}
        {T.suprapozabil&&<Check label="Corp suprapus (supantă)" v={suprapus} set={setSuprapus}/>}

        <Sec>Material corp</Sec>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7,marginBottom:6}}>
          {Object.entries(C.materialeCorp).map(([n,m])=>(
            <button key={n} title={n} onClick={()=>setMaterialExt(n)}
              style={{aspectRatio:"1",borderRadius:11,cursor:"pointer",background:m.hex,
                border:materialExt===n?"2.5px solid #a37e4a":"1px solid rgba(0,0,0,.1)",
                boxShadow:materialExt===n?"0 0 0 3px rgba(163,126,74,.25)":"inset 0 0 0 1px rgba(255,255,255,.25)"}}/>))}
        </div>
        <div style={{fontSize:11.5,color:"#8a8378",marginBottom:4}}>{materialExt} · {C.materialeCorp[materialExt].pretMp} lei/mp</div>

        <Sec>Fronturi</Sec>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7,marginBottom:6}}>
          <button title="La fel ca corpul" onClick={()=>setMaterialFront(null)}
            style={{aspectRatio:"1",borderRadius:11,cursor:"pointer",background:"linear-gradient(135deg,#eee 50%,#ccc 50%)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#666",fontWeight:600,
              border:materialFront===null?"2.5px solid #a37e4a":"1px solid rgba(0,0,0,.1)",
              boxShadow:materialFront===null?"0 0 0 3px rgba(163,126,74,.25)":"none"}}>=corp</button>
          {Object.entries(C.materialeCorp).map(([n,m])=>(
            <button key={n} title={n} onClick={()=>setMaterialFront(n)}
              style={{aspectRatio:"1",borderRadius:11,cursor:"pointer",background:m.hex,
                border:materialFront===n?"2.5px solid #a37e4a":"1px solid rgba(0,0,0,.1)",
                boxShadow:materialFront===n?"0 0 0 3px rgba(163,126,74,.25)":"inset 0 0 0 1px rgba(255,255,255,.25)"}}/>))}
        </div>
        <div style={{fontSize:11.5,color:"#8a8378",marginBottom:4}}>{materialFront?`Fronturi: ${materialFront}`:"Fronturi la fel ca corpul"}</div>

        <Sec>Mânere</Sec>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
          {Object.entries(C.tipuriManer).map(([n,m])=>(
            <button key={n} onClick={()=>setTipManer(n)}
              style={{padding:"7px 11px",borderRadius:9,cursor:"pointer",fontSize:11.5,fontWeight:600,
                background:tipManer===n?"#f3ede3":"#fff",color:"#3a3630",
                border:tipManer===n?"2px solid #a37e4a":"1px solid #d8d2c6"}}>{n}</button>))}
        </div>


        {T.blat&&<><Sec>Blat</Sec>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {Object.entries(C.blaturi).map(([n,b])=>(
              <button key={n} title={n} onClick={()=>setBlat(n)}
                style={{width:38,height:26,borderRadius:8,cursor:"pointer",
                  background:b.hex||"repeating-linear-gradient(45deg,#eee,#eee 4px,#ddd 4px,#ddd 8px)",
                  border:blat===n?"2.5px solid #a37e4a":"1px solid rgba(0,0,0,.12)"}}/>))}
          </div>
          <div style={{fontSize:11.5,color:"#8a8378",margin:"4px 0"}}>{blat}</div></>}

        <Sec>Accesorii</Sec>
        {Object.entries(C.accesoriiCategorii).map(([cat,items])=>{
          const nrSel=Object.keys(items).filter(n=>accesoriiSel.includes(n)).length;
          const open=openCat===cat;
          return (
            <div key={cat} style={{borderBottom:"1px solid #f0ece5"}}>
              <button onClick={()=>setOpenCat(open?null:cat)} style={{width:"100%",display:"flex",justifyContent:"space-between",padding:"9px 0",background:"none",border:"none",cursor:"pointer",fontSize:12.5,fontWeight:700,color:"#2a2622"}}>
                <span>{cat} {nrSel>0&&<span style={{color:"#a37e4a",fontSize:11}}>({nrSel})</span>}</span>
                <span style={{color:"#a8a29e"}}>{open?"\u25b2":"\u25bc"}</span>
              </button>
              {open&&<div style={{paddingBottom:8}}>{Object.entries(items).map(([nume,a])=>(
                <label key={nume} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",cursor:"pointer",fontSize:12}}>
                  <input type="checkbox" checked={accesoriiSel.includes(nume)} onChange={()=>toggleAcc(nume)} style={{accentColor:"#a37e4a"}}/>
                  <span style={{flex:1}}>{nume}</span>
                  {C.afisarePret&&<span style={{fontSize:10.5,color:"#8a8378"}}>{a.pret} lei/{umRegula(a.regula)}</span>}
                </label>))}</div>}
            </div>
          );
        })}
      </div>

      {/* PANOU PRET — dreapta, plutitor */}
      <div className="fz-panel" style={{...panou,right:18,top:64,width:280,animationDelay:"140ms"}}>
        <div style={{fontSize:11,color:"#8a8378",letterSpacing:1,textTransform:"uppercase"}}>Estimare</div>
        {C.afisarePret&&(
          <div style={{fontFamily:DISPLAY,fontSize:38,fontWeight:800,color:"#a37e4a",letterSpacing:-1,margin:"2px 0 0",fontVariantNumeric:"tabular-nums"}}>
            {lei(pretA)}
          </div>)}
        <div style={{fontSize:11,color:"#a8a29e",marginBottom:10}}>Estimare inițială — oferta finală după măsurători, împreună cu echipa noastră.</div>
        <button onClick={()=>setDetalii(!detalii)} style={{...pillMic,marginBottom:detalii?8:12}}>{detalii?"Ascunde detaliile":"Vezi detaliile devizului"}</button>
        {detalii&&(
          <div style={{maxHeight:230,overflowY:"auto",marginBottom:12}}>
            <table style={{width:"100%",fontSize:11.5,borderCollapse:"collapse"}}>
              <tbody>{deviz.linii.map((l,i)=>(
                <tr key={l.desc+i} className="fz-linie" style={{borderTop:"1px solid #f0ece5",background:l.acc?"#faf6ef":"none"}}>
                  <td style={{padding:"4px 0"}}>{l.desc}</td>
                  <td style={{textAlign:"right",color:"#8a8378",whiteSpace:"nowrap",paddingLeft:6}}>{num(l.cant,(l.um==="buc"||l.um==="set")?0:2)} {l.um}</td>
                  {C.afisarePret&&<td style={{textAlign:"right",whiteSpace:"nowrap",paddingLeft:6}}>{l.total>0?lei(l.total):"\u2014"}</td>}
                </tr>))}</tbody>
            </table>
          </div>)}
        <button onClick={spreFormular} style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:"#a37e4a",color:"#fff",fontSize:14.5,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 18px rgba(163,126,74,.35)"}}>Solicită ofertă</button>
      </div>

      {/* rezumat discret jos */}
      <div style={{position:"absolute",left:"50%",bottom:14,transform:"translateX(-50%)",fontSize:11.5,color:"#7c766c",background:"rgba(255,255,255,.7)",backdropFilter:"blur(6px)",padding:"6px 14px",borderRadius:20,whiteSpace:"nowrap",maxWidth:"70vw",overflow:"hidden",textOverflow:"ellipsis"}}>
        {latime}×{inaltime}×{adancime} mm · {C.modeleLayout[model].nume} · {turnuri} turnuri
      </div>
    </div>
  );
}

const panou={position:"absolute",background:"rgba(255,255,255,.9)",backdropFilter:"blur(10px)",borderRadius:18,padding:"14px 16px",boxShadow:"0 8px 32px rgba(40,30,20,.14)"};
const pill={background:"rgba(255,255,255,.85)",backdropFilter:"blur(8px)",border:"1px solid #e7e5e4",borderRadius:20,padding:"7px 14px",fontSize:13,color:"#a37e4a",cursor:"pointer"};
const pillMic={width:"100%",background:"#faf6ef",border:"1px solid #eadfce",borderRadius:9,padding:"8px 0",fontSize:12,fontWeight:600,color:"#a37e4a",cursor:"pointer"};
const Sec=({children})=><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#a37e4a",margin:"13px 0 7px"}}>{children}</div>;
const btn={width:28,height:28,borderRadius:7,border:"none",background:"#efe9e0",color:"#2a2622",fontSize:15,cursor:"pointer"};
function Sl({label,v,set,min,max,step,unit="mm"}){return(<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12.5,fontWeight:600}}>{label}</span><span style={{fontSize:12.5,color:"#8a8378"}}>{v} {unit}</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><button onClick={()=>set(Math.max(min,v-step))} style={btn}>-</button><input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(Number(e.target.value))} style={{flex:1,accentColor:"#a37e4a"}}/><button onClick={()=>set(Math.min(max,v+step))} style={btn}>+</button></div></div>);}
function Check({label,v,set}){return(<label style={{display:"flex",gap:8,fontSize:12.5,marginBottom:7,cursor:"pointer",alignItems:"center"}}><input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} style={{accentColor:"#a37e4a"}}/>{label}</label>);}
