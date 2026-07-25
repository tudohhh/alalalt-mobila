// src/Formular.jsx — pas final: date livrare -> fișă tehnică
import React, { useState } from "react";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";

const lei=n=>Math.round(n).toLocaleString("ro-RO")+" lei";

export default function Formular({ rezumat, deviz, poza, inapoi }) {
  const [f,setF]=useState({nume:"",telefon:"",email:"",zona:"",localitate:"",etaj:"",obs:"",gdpr:false,website:""});
  const [trimis,setTrimis]=useState(null);
  const [err,setErr]=useState("");
  const set=k=>e=>setF({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value});
  const inp={display:"block",width:"100%",marginTop:4,padding:"9px 10px",borderRadius:8,border:"1px solid #e7e5e4",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"};
  const card={background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)"};

  const trimite=()=>{
    if(f.website)return;
    if(!f.nume||!f.telefon||!f.zona||!f.localitate)return setErr("Completați câmpurile obligatorii (*).");
    if(!f.gdpr)return setErr("Bifați acordul de prelucrare a datelor.");
    setErr("");
    const cerere={...f,id:"CERERE-"+Date.now().toString(36).toUpperCase(),rezumat,total:deviz?.total,poza};
    console.log("CERERE:",cerere); // TODO backend: Supabase + email + Telegram
    setTrimis(cerere);
  };

  if(trimis) return (
    <div style={{maxWidth:620,margin:"0 auto"}}>
      <div style={{...card,textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:40}}>✓</div>
        <h1 style={{fontSize:24,fontWeight:800,margin:"6px 0"}}>Cerere trimisă</h1>
        <p style={{color:"#8a8378"}}>Vă contactăm cu oferta în cel mai scurt timp. Termen estimativ producție: <b>{C.livrare.termenEstimativ}</b>.</p>
      </div>
      <div style={card}>
        <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#a37e4a",marginBottom:12}}>Fișa tehnică (către atelier)</div>
        <Rand k="ID cerere" v={trimis.id}/>
        <Rand k="Configurație" v={rezumat}/>
        {C.afisarePret&&deviz&&<Rand k="Total estimat afișat" v={lei(deviz.total)}/>}
        <div style={{height:1,background:"#eee",margin:"10px 0"}}/>
        <Rand k="Client" v={trimis.nume}/>
        <Rand k="Telefon" v={trimis.telefon}/>
        <Rand k="Email" v={trimis.email||"—"}/>
        <Rand k="Zonă / localitate" v={`${trimis.zona} · ${trimis.localitate}`}/>
        <Rand k="Etaj / acces" v={trimis.etaj||"—"}/>
        <Rand k="Observații" v={trimis.obs||"—"}/>
        {poza&&<img src={poza} alt="" style={{width:"100%",borderRadius:10,marginTop:12,border:"1px solid #eee"}}/>}
        <div style={{fontSize:11,color:"#a8a29e",marginTop:12}}>În producție: se salvează în Supabase + email/Telegram către atelier.</div>
      </div>
      <button onClick={inapoi} style={{marginTop:14,padding:"9px 16px",borderRadius:9,border:"1px solid #ccc",background:"#fff",cursor:"pointer"}}>← înapoi la configurator</button>
    </div>
  );

  return (
    <div style={{maxWidth:560,margin:"0 auto"}}>
      <button onClick={inapoi} style={{fontSize:13,color:"#a37e4a",background:"none",border:"none",cursor:"pointer",fontWeight:600,marginBottom:8}}>← înapoi la configurator</button>
      <h1 style={{fontSize:24,fontWeight:800,margin:"2px 0 4px"}}>Trimite cererea de ofertă</h1>
      <p style={{fontSize:13,color:"#8a8378",marginBottom:16}}>Primești oferta de la un om, în cel mai scurt timp.</p>
      <div style={{...card,marginBottom:12}}>
        <div style={{fontSize:12,color:"#8a8378",marginBottom:8}}>Configurația ta</div>
        <div style={{fontSize:14,fontWeight:600}}>{rezumat}</div>
        {C.afisarePret&&deviz&&<div style={{fontSize:20,fontWeight:800,color:"#a37e4a",marginTop:6}}>{lei(deviz.total)} <span style={{fontSize:12,fontWeight:400,color:"#a8a29e"}}>estimativ</span></div>}
      </div>
      <div style={{...card,display:"grid",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label style={{fontSize:13}}>Nume*<input value={f.nume} onChange={set("nume")} style={inp}/></label>
          <label style={{fontSize:13}}>Telefon*<input value={f.telefon} onChange={set("telefon")} style={inp}/></label>
        </div>
        <label style={{fontSize:13}}>Email<input value={f.email} onChange={set("email")} style={inp}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label style={{fontSize:13}}>Zonă*<select value={f.zona} onChange={set("zona")} style={inp}><option value="">— alege —</option>{C.livrare.zone.map(z=><option key={z}>{z}</option>)}</select></label>
          <label style={{fontSize:13}}>Localitate*<input value={f.localitate} onChange={set("localitate")} style={inp}/></label>
        </div>
        <label style={{fontSize:13}}>Etaj / acces<input value={f.etaj} onChange={set("etaj")} placeholder="ex: et. 3, cu lift" style={inp}/></label>
        <div style={{fontSize:12,color:"#8a8378",background:"#faf6ef",padding:"8px 10px",borderRadius:8}}>Termen estimativ producție: <b>{C.livrare.termenEstimativ}</b> (informativ, se confirmă la ofertă)</div>
        <label style={{fontSize:13}}>Observații<textarea value={f.obs} onChange={set("obs")} rows={2} style={{...inp,resize:"vertical"}}/></label>
        <label style={{display:"flex",gap:8,fontSize:12.5,color:"#57534e",alignItems:"flex-start"}}>
          <input type="checkbox" checked={f.gdpr} onChange={set("gdpr")} style={{marginTop:3}}/>
          <span>Sunt de acord cu prelucrarea datelor pentru a primi oferta. (link politică de confidențialitate)</span>
        </label>
        <input value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" style={{position:"absolute",left:"-9999px"}} aria-hidden="true"/>
        {err&&<div style={{color:"#b91c1c",fontSize:13}}>{err}</div>}
        <button onClick={trimite} style={{padding:13,borderRadius:10,border:"none",background:"#a37e4a",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Trimite cererea de ofertă</button>
      </div>
    </div>
  );
}
const Rand=({k,v})=>(<div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:13,padding:"3px 0"}}><span style={{color:"#8a8378"}}>{k}</span><span style={{fontWeight:600,textAlign:"right"}}>{v}</span></div>);
