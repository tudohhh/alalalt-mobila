// Scena3D MINIMALĂ – doar mobilierul, fără pereți/parchet/covor
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";
import { calculeaza } from "../../utils/calcul.js";

const rad = g => (g * Math.PI) / 180;

// ═══ Materiale PBR portate din configurator-mobila (lemn realist, ═══
// ═══ environment, decoruri) — completează funcțiile pe care    ═══
// ═══ Scena3D le folosea dar nu le avea definite.               ═══
const srgbT = t => { if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; return t; };

// ——— lemn procedural v2: fibre lungi + inele + variație de nuanță ———
const _lemnCache={};
let _envCache=null;
let _parchetCache=null;
function _parchetTex(){
  if(_parchetCache) return _parchetCache;
  const pc=document.createElement("canvas");pc.width=1024;pc.height=1024;
  const px2=pc.getContext("2d");px2.fillStyle="#cdbfa8";px2.fillRect(0,0,1024,1024);
  for(let i=0;i<8;i++){px2.fillStyle=i%2?"#c6b79f":"#d2c4ad";px2.fillRect(0,i*128,1024,126);
    px2.fillStyle="rgba(90,70,45,0.08)";for(let j=0;j<40;j++){px2.fillRect(Math.random()*1024,i*128+Math.random()*126,60+Math.random()*180,1);}}
  const ptx=srgbT(new THREE.CanvasTexture(pc));ptx.wrapS=ptx.wrapT=THREE.RepeatWrapping;ptx.repeat.set(22,22);ptx.anisotropy=8;
  _parchetCache=ptx; return ptx;
}
function _envTex(renderer){
  if(_envCache) return _envCache;
  const w=1024,h=512,c=document.createElement("canvas");c.width=w;c.height=h;
  const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#f7efe1");g.addColorStop(0.45,"#eae1d3");g.addColorStop(0.55,"#d6ccb9");g.addColorStop(1,"#4f4a40");
  x.fillStyle=g;x.fillRect(0,0,w,h);
  for(const cx of [w*0.30,w*0.70]){                       // 2 ferestre luminoase (structura in reflexii)
    x.fillStyle="rgba(255,252,244,0.98)";x.fillRect(cx-85,h*0.20,170,h*0.46);
    x.strokeStyle="rgba(70,60,48,0.55)";x.lineWidth=8;x.strokeRect(cx-85,h*0.20,170,h*0.46);
    x.beginPath();x.moveTo(cx,h*0.20);x.lineTo(cx,h*0.66);x.moveTo(cx-85,h*0.43);x.lineTo(cx+85,h*0.43);x.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;
  if("colorSpace" in t)t.colorSpace=THREE.SRGBColorSpace;
  if(renderer && THREE.PMREMGenerator){                   // prefiltrare PMREM -> reflexii curate pe orice roughness
    try{ const pm=new THREE.PMREMGenerator(renderer); pm.compileEquirectangularShader();
      const env=pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose(); _envCache=env; return env; }
    catch(e){ _envCache=t; return t; }
  }
  _envCache=t; return t;
}
function texturaLemn(baza, inchis){
  const key=baza+"|"+inchis; if(_lemnCache[key]) return _lemnCache[key];
  const c=document.createElement("canvas");c.width=1024;c.height=1024;
  const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,1024,0);
  g.addColorStop(0,baza);g.addColorStop(0.5,shade(baza,1.04));g.addColorStop(1,baza);
  x.fillStyle=g;x.fillRect(0,0,1024,1024);
  for(let i=0;i<340;i++){
    const gx=Math.random()*1024,w=0.4+Math.random()*2.4;
    x.strokeStyle=inchis;x.globalAlpha=0.025+Math.random()*0.06;x.lineWidth=w;
    x.beginPath();
    for(let y=0;y<=1024;y+=6){
      const off=Math.sin(y*0.006+gx)*9+Math.sin(y*0.03+gx*2)*2.5;
      y===0?x.moveTo(gx+off,y):x.lineTo(gx+off,y);
    }
    x.stroke();
  }
  // noduri discrete
  for(let i=0;i<5;i++){
    const nx=Math.random()*1024,ny=Math.random()*1024;
    for(let r=14;r>2;r-=2.5){
      x.globalAlpha=0.05;x.strokeStyle=inchis;x.lineWidth=1.1;
      x.beginPath();x.ellipse(nx,ny,r*0.7,r,0.3,0,Math.PI*2);x.stroke();
    }
  }
  x.globalAlpha=1;
  const tx=new THREE.CanvasTexture(c);
  tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.anisotropy=8;
  const out=srgbT(tx); _lemnCache[key]=out; return out;
}
function shade(hex,f){
  const n=parseInt(hex.slice(1),16),r=Math.min(255,((n>>16)&255)*f),g=Math.min(255,((n>>8)&255)*f),b=Math.min(255,(n&255)*f);
  return `rgb(${r|0},${g|0},${b|0})`;
}
// umbră de contact — pată radială moale sub mobilier
function umbraContact(){
  const c=document.createElement("canvas");c.width=256;c.height=256;
  const x=c.getContext("2d");
  const g=x.createRadialGradient(128,128,10,128,128,128);
  g.addColorStop(0,"rgba(35,28,20,0.42)");g.addColorStop(0.55,"rgba(35,28,20,0.16)");g.addColorStop(1,"rgba(35,28,20,0)");
  x.fillStyle=g;x.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}

// ——— lemn PBR (furnir calm: fibra fina + cateva vene neregulate + normal map) ———
class _FastNoise{ constructor(seed=12345){ this.p=new Uint8Array(512); let s=(seed|0)||1;
  for(let i=0;i<256;i++){ s=(s*16807)%2147483647; this.p[i]=this.p[i+256]=s&255; } }
  fade(t){return t*t*t*(t*(t*6-15)+10);} lerp(t,a,b){return a+t*(b-a);}
  grad(h,x,y){h&=7;const u=h<4?x:y,v=h<4?y:x;return((h&1)===0?u:-u)+((h&2)===0?v:-v);}
  noise(px,py){const ix=Math.floor(px)&255,iy=Math.floor(py)&255,fx=px-Math.floor(px),fy=py-Math.floor(py),u=this.fade(fx),v=this.fade(fy),a=this.p[ix]+iy,b=this.p[ix+1]+iy;
    return this.lerp(v,this.lerp(u,this.grad(this.p[a],fx,fy),this.grad(this.p[b],fx-1,fy)),this.lerp(u,this.grad(this.p[a+1],fx,fy-1),this.grad(this.p[b+1],fx-1,fy-1)));}}
const _hexRGB=h=>{h=(h+"").replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
const _linT=t=>{ if("colorSpace" in t) t.colorSpace=THREE.NoColorSpace; return t; };
const _woodPBRCache={};
function woodPBR(hex, seed=42, baseRough=0.42){
  const key=hex+"|"+seed+"|"+baseRough; if(_woodPBRCache[key]) return _woodPBRCache[key];
  const size=512, noise=new _FastNoise(seed), [rB,gB,bB]=_hexRGB(hex||"#b98a52");
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=size;return c;};
  const cM=mk(),cR=mk(),cN=mk(); const xm=cM.getContext('2d'),xr=cR.getContext('2d'),xn=cN.getContext('2d');
  const im=xm.createImageData(size,size),ir=xr.createImageData(size,size),ino=xn.createImageData(size,size);
  const dM=im.data,dR=ir.data,dN=ino.data, hb=new Float32Array(size*size);
  const streaks=[]; for(let i=0;i<4;i++) streaks.push({x:(i+0.5)/4 + noise.noise(i*13.7,2.1)*0.08, w:0.012+Math.abs(noise.noise(i*3.1,9.4))*0.025, d:0.18+Math.abs(noise.noise(i*1.7,5.5))*0.22, wob:0.02+Math.abs(noise.noise(i,7))*0.03});
  for(let py=0;py<size;py++)for(let px=0;px<size;px++){const idx=(py*size+px)*4,hi=py*size+px,ux=px/size,uy=py/size;
    const wx=noise.noise(uy*2.0,seed*0.013)*0.025+noise.noise(uy*5.0,3.3)*0.012, gx=ux+wx;
    const drift=(noise.noise(ux*1.3+seed*0.007,uy*1.1)*0.5+0.5)*0.10;
    const fiber=(noise.noise(gx*170,uy*3.0)*0.5+0.5)*0.09+(noise.noise(gx*85,uy*2.0)*0.5+0.5)*0.05;
    let streak=0; for(const s of streaks){ const cxs=s.x+Math.sin(uy*6.0+s.x*20)*s.wob*0.4+noise.noise(uy*3.0,s.x*10)*s.wob; const dd=Math.abs(gx-cxs); if(dd<s.w){ const t=1-dd/s.w; streak=Math.max(streak,Math.pow(t,1.6)*s.d);} }
    let df=drift*0.5+fiber+streak; df=Math.min(0.55,Math.max(0,df)); const sc=1-df; hb[hi]=fiber+streak*0.4;
    dM[idx]=rB*sc; dM[idx+1]=gB*sc; dM[idx+2]=bB*sc; dM[idx+3]=255;
    const rb=Math.floor(Math.min(1,baseRough+streak*0.35+fiber*0.6)*255); dR[idx]=dR[idx+1]=dR[idx+2]=rb; dR[idx+3]=255;
  }
  const ns=1.6;
  for(let py=0;py<size;py++)for(let px=0;px<size;px++){const idx=(py*size+px)*4;
    const xL=hb[py*size+(px>0?px-1:px)],xR=hb[py*size+(px<size-1?px+1:px)],yU=hb[(py>0?py-1:py)*size+px],yD=hb[(py<size-1?py+1:py)*size+px];
    const dx=(xL-xR)*ns,dy=(yU-yD)*ns,l=Math.sqrt(dx*dx+dy*dy+1);
    dN[idx]=((dx/l)*0.5+0.5)*255; dN[idx+1]=((dy/l)*0.5+0.5)*255; dN[idx+2]=((1/l)*0.5+0.5)*255; dN[idx+3]=255;
  }
  xm.putImageData(im,0,0); xr.putImageData(ir,0,0); xn.putImageData(ino,0,0);
  const map=srgbT(new THREE.CanvasTexture(cM)), roughnessMap=_linT(new THREE.CanvasTexture(cR)), normalMap=_linT(new THREE.CanvasTexture(cN));
  [map,roughnessMap,normalMap].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;});
  const out={map,roughnessMap,normalMap}; _woodPBRCache[key]=out; return out;
}
const _seedFromName=n=>{let h=0; n=(n||"")+""; for(let i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))>>>0; return (h%1000)+1;};

function _woodDecorFor(nume){
  const M=C.materialeCorp[nume]||Object.values(C.materialeCorp)[0];
  const ePal=(M.clasa||"").startsWith("pal");
  const woodHex = M.tex ? M.tex[0] : ePal ? M.hex : null;
  if(!woodHex) return null;
  const eLucios=/lucios/i.test(nume);
  return { pbr: woodPBR(woodHex, _seedFromName(nume), eLucios?0.16:0.42), eLucios };
}
const _swmCache={};
function _sizedWoodMat(decor, w, h, dir){
  const TILE=0.42, pbr=decor.pbr;
  const key=pbr.map.uuid+"|"+Math.round(w*50)+"|"+Math.round(h*50)+"|"+dir;
  if(_swmCache[key]) return _swmCache[key];
  const seed=(Math.round(w*97)*31+Math.round(h*97))>>>0;
  const ox=((seed*0.137)%1+1)%1, oy=((seed*0.071)%1+1)%1;
  const cl=t=>{ const c=t.clone(); c.wrapS=c.wrapT=THREE.MirroredRepeatWrapping; c.center.set(0.5,0.5);
    if(dir==="h"){ c.rotation=Math.PI/2; c.repeat.set(Math.max(0.25,h/TILE),Math.max(0.25,w/TILE)); }
    else { c.rotation=0; c.repeat.set(Math.max(0.25,w/TILE),Math.max(0.25,h/TILE)); }
    c.offset.set(ox,oy); c.needsUpdate=true; return c; };
  const m=new THREE.MeshStandardMaterial({ map:cl(pbr.map), roughnessMap:cl(pbr.roughnessMap), normalMap:cl(pbr.normalMap),
    normalScale:new THREE.Vector2(0.3,0.3), roughness:1.0, metalness:0.03, envMapIntensity:decor.eLucios?1.3:0.5 });
  _swmCache[key]=m; return m;
}


function matDinObj(M, nume){
  M=M||Object.values(C.materialeCorp)[0]||{};
  const finish=_finishOf(M);
  if(finish==="lemn"){
    const pbr=woodPBR(M.tex?M.tex[0]:M.hex, _seedFromName(nume||M.nume||"lemn"), 0.42);
    return new THREE.MeshStandardMaterial({
      map:pbr.map, roughnessMap:pbr.roughnessMap, normalMap:pbr.normalMap,
      normalScale:new THREE.Vector2(0.3,0.3),
      roughness:1.0, metalness:0.03, envMapIntensity:0.5,
    });
  }
  if(finish==="lucios"){
    return new THREE.MeshPhysicalMaterial({
      color:new THREE.Color(M.hex), roughness:0.12, metalness:0.0,
      clearcoat:1.0, clearcoatRoughness:0.06, envMapIntensity:1.4,
    });
  }
  if(finish==="riflaj"){
    return new THREE.MeshStandardMaterial({ color:new THREE.Color(M.hex), roughness:0.5, metalness:0.04, envMapIntensity:0.6 });
  }
  return new THREE.MeshStandardMaterial({ color:new THREE.Color(M.hex), roughness:0.62, metalness:0.02, envMapIntensity:0.35 });
}
function matDin(nume){ return matDinObj(C.materialeCorp[nume], nume); }


export default function Scena3D({ cfg, tip, onReady }) {
  const mount = useRef(null);
  useEffect(() => {
    const el = mount.current;
    const W = el.clientWidth, H = el.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f0ece6");
    
    const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    cam.position.set(2.5, 2.2, 3.8);
    cam.lookAt(0, 0.8, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    // Environment map din configurator-mobila: materialele PBR de lemn au
    // envMapIntensity, dar fără scene.environment n-ar reflecta nimic (suprafețe
    // moarte). Îl conectăm ca lemnul să prindă viață — reflexii subtile de
    // interior (are chiar ferestre în reflexie pentru realism).
    scene.environment = _envTex(renderer);
    
    // --- mobilierul ---
    
    
    // --- iluminare minimală ---
    // ——— lumini: key cald + fill rece + rim din spate ———
    scene.add(new THREE.HemisphereLight(0xfff6ea,0xb8ae9f,0.4));
    const key=new THREE.DirectionalLight(0xffeeda,2.0);
    key.position.set(3.6,3.1,1.5);key.castShadow=true;
    key.shadow.mapSize.set(2048,2048);key.shadow.radius=3.5;
    // frustum care cuprinde mobila + planta din colt (la ~L/2+0.55, D/2+0.1) + covor
    const sExt=Math.max(L,D)*1.1+1.4;
    key.shadow.camera.left=-sExt;key.shadow.camera.right=sExt;key.shadow.camera.top=sExt;key.shadow.camera.bottom=-sExt;
    key.shadow.camera.near=0.5;key.shadow.camera.far=Math.max(18,(L+Htot+D)*2.5);
    key.shadow.bias=-0.00018;key.shadow.normalBias=0.02;
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const fill=new THREE.DirectionalLight(0xdfe8ff,0.32);fill.position.set(-3,1.6,1.5);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xfff3e2,0.85);rim.position.set(-1.5,2.8,-2.5);scene.add(rim);

    // ——— materiale ———
    const matExt=matDin(materialExt);
    const _frontDecor=_woodDecorFor(materialExt);
    const matGap=new THREE.MeshBasicMaterial({color:0x151210});      // rostul (shadow gap)
    const matMet=new THREE.MeshStandardMaterial({color:0x232323,roughness:0.3,metalness:0.9});
// MeshPhysicalMaterial eliminat
    const box=(w,h,d,x,y,z,m)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||matExt);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;g.add(me);return me;};
    // front cu CANT: fata din materialul ales, muchiile din cant (mai inchis, satinat)
    const matCant=new THREE.MeshStandardMaterial({color:new THREE.Color((C.materialeCorp[materialExt]||{}).hex||"#c9a36a").multiplyScalar(0.72),roughness:0.35,metalness:0.05});
    const front=(w,h,d,x,y,z,mFata)=>{
      let fMat = mFata||matExt;
      if(_frontDecor && (!mFata || mFata===matExt)) fMat=_sizedWoodMat(_frontDecor, w, h, h>=w?"v":"h");
      const mats=[matCant,matCant,matCant,matCant,fMat,matCant];
      const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);
      me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;g.add(me);return me;};

    // ——— carcasa ———
    const cy=yBaza+Hmain/2;
    box(t,Hmain,D,-L/2+t/2,cy,0);box(t,Hmain,D,L/2-t/2,cy,0);
    box(L,t,D,0,yBaza+Hmain-t/2,0);box(L,t,D,0,yBaza+t/2,0);
    box(L-2*t,Hmain,0.006,0,cy,-D/2+0.004);
    // (v2.2) fundalul intunecat se pune per-turn, doar in spatele usilor pline

    if(arePicioare)[[-L/2+0.05,-D/2+0.05],[L/2-0.05,-D/2+0.05],[-L/2+0.05,D/2-0.05],[L/2-0.05,D/2-0.05]].forEach(([px,pz])=>{
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.010,0.08,14),matMet);
      leg.position.set(px,0.04,pz);leg.castShadow=true;g.add(leg);
    });
    if(T.blat && cfg.blat!=="Fără blat"){
      const bHex=C.blaturi[cfg.blat]?.hex||"#555";
      box(L+0.02,0.028,D+0.02,0,yBaza+Hmain+0.014,0,new THREE.MeshStandardMaterial({color:new THREE.Color(bHex),roughness:0.18,metalness:0.12,envMapIntensity:1.1}));
    }

    // ——— fronturi cu SHADOW GAP (rost 3mm întunecat) ———
    const nT=Math.max(1,turnuri),latTurn=(L-(nT+1)*t)/nT;
    const frontZ=D/2+0.004,gap=0.003;
    for(let i=0;i<nT;i++){
      const xStanga=-L/2+t+i*(latTurn+t),xc=xStanga+latTurn/2;
      if(i<nT-1) box(t,Hmain-2*t,D,xStanga+latTurn+t/2,cy,0);
      if(model.deschis){
        // fund din material (nu gol) + rafturi + bara de haine sus
        box(latTurn,Hmain-2*t,0.006,xc,cy,-D/2+0.006,matExt);
        const nr=Math.max(2,Math.round(Hmain/0.4));
        for(let r=1;r<nr;r++) box(latTurn,t,D-0.03,xc,yBaza+t+(Hmain-2*t)*(r/nr),0);
        // bara metalica de haine in compartimentul de sus
        const bara=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,latTurn-0.04,12),matMet);
        bara.rotation.z=Math.PI/2;bara.position.set(xc,yBaza+Hmain-0.12,0.02);bara.castShadow=true;g.add(bara);
        continue;
      }
      const sertZ=sertarePerTurn>0?Math.min(Hmain*0.3,0.45):0;
      const yUsiJos=yBaza+t+sertZ,usiH=Hmain-t-sertZ-t;
      const eVitrina=model.vitrina && i===nT-1;
      if(!eVitrina){
        box(latTurn,usiH,0.002,xc,yUsiJos+usiH/2,D/2-0.008,matGap);
        front(latTurn-2*gap,usiH-2*gap,0.018,xc,yUsiJos+usiH/2,frontZ,matExt);
      } else {
        // vitrina: polite interioare vizibile prin geam + usa cu rama din material
        for(let r=1;r<=2;r++) box(latTurn,t,D-0.04,xc,yUsiJos+(usiH/3)*r,0);
        const fw=Math.min(0.055,latTurn*0.16),gw=latTurn-2*gap,gh=usiH-2*gap,yC=yUsiJos+usiH/2;
        box(gw,fw,0.018,xc,yUsiJos+usiH-gap-fw/2,frontZ);
        box(gw,fw,0.018,xc,yUsiJos+gap+fw/2,frontZ);
        box(fw,gh-2*fw,0.018,xc-gw/2+fw/2,yC,frontZ);
        box(fw,gh-2*fw,0.018,xc+gw/2-fw/2,yC,frontZ);
        // matSticla eliminat
    box(gw-2*fw,gh-2*fw,0.006,xc,yC,frontZ-0.004);
      }
      // mâner: profil îngust vertical, discret
      const h=new THREE.Mesh(new THREE.BoxGeometry(0.008,Math.min(0.16,usiH*0.3),0.012),matMet);
      const hSide=(i%2===0)?1:-1;                      // perechi oglindite
      h.position.set(xc+hSide*(latTurn/2-0.028),yUsiJos+usiH/2,frontZ+0.014);h.castShadow=true;g.add(h);
      if(sertZ>0){
        const ns=sertarePerTurn,sh=sertZ/ns;
        for(let s=0;s<ns;s++){
          const ycc=yBaza+t+sh/2+s*sh;
          front(latTurn-2*gap,sh-2*gap,0.018,xc,ycc,frontZ);
          const bar=new THREE.Mesh(new THREE.BoxGeometry(Math.min(0.22,latTurn*0.45),0.008,0.012),matMet);
          bar.position.set(xc,ycc+sh/2-0.018,frontZ+0.014);bar.castShadow=true;g.add(bar);
        }
      }
    }
    if(suprapus){
      const Hsup=Htot*0.3,ySup=yBaza+Hmain,cyS=ySup+Hsup/2;
      box(t,Hsup,D,-L/2+t/2,cyS,0);box(t,Hsup,D,L/2-t/2,cyS,0);
      box(L,t,D,0,ySup+Hsup-t/2,0);box(L,t,D,0,ySup+t/2,0);box(L-2*t,Hsup,0.006,0,cyS,-D/2+0.004);
      for(let i=0;i<nT;i++){
        const xc=-L/2+t+i*(latTurn+t)+latTurn/2;
        if(i<nT-1)box(t,Hsup-2*t,D,-L/2+t+i*(latTurn+t)+latTurn+t/2,cyS,0);
        front(latTurn-2*gap,Hsup-2*t-2*gap,0.018,xc,cyS,frontZ);
        const h=new THREE.Mesh(new THREE.BoxGeometry(Math.min(0.18,latTurn*0.4),0.008,0.012),matMet);
        h.position.set(xc,ySup+0.05,frontZ+0.014);g.add(h);
      }
    }
    scene.add(g);

    // ——— cameră: intro animat + inerție la drag ———
    const target=new THREE.Vector3(0,(yBaza+Htot)/2,0);
    const rRest=Math.max(L,Htot)*1.75+0.55;
    let th=0.62,ph=1.22,r=rRest,drag=false,px=0,py=0;
    const thMin=-1.08,thMax=1.08;let idleDir=1;      // camera doar in fata peretilor
    let vth=0,vph=0;                    // inerție
    let intro=0;                        // 0->1 easing la pornire
    const upd=()=>{cam.position.set(target.x+r*Math.sin(ph)*Math.sin(th),target.y+r*Math.cos(ph),target.z+r*Math.sin(ph)*Math.cos(th));cam.lookAt(target);};
    const dom=rnd.domElement;
    const down=(x,y)=>{drag=true;px=x;py=y;vth=0;vph=0;};
    const move=(x,y)=>{if(!drag)return;const dx=(x-px)*0.008,dy=(y-py)*0.008;th=Math.max(thMin,Math.min(thMax,th-dx));ph-=dy;vth=-dx;vph=-dy;ph=Math.max(0.4,Math.min(1.45,ph));px=x;py=y;};
    const up=()=>drag=false;
    dom.addEventListener("mousedown",e=>down(e.clientX,e.clientY));
    window.addEventListener("mousemove",e=>move(e.clientX,e.clientY));
    window.addEventListener("mouseup",up);
    dom.addEventListener("touchstart",e=>{const q=e.touches[0];down(q.clientX,q.clientY);},{passive:true});
    dom.addEventListener("touchmove",e=>{const q=e.touches[0];move(q.clientX,q.clientY);},{passive:true});
    dom.addEventListener("touchend",up);
    dom.addEventListener("wheel",e=>{e.preventDefault();r=Math.max(1,Math.min(9,r+e.deltaY*0.002));},{passive:false});

    const capture=()=>{const s=cam.position.clone();cam.position.set(target.x+rRest*0.7,target.y+rRest*0.5,target.z+rRest*0.92);cam.lookAt(target);rnd.render(scene,cam);const dd=rnd.domElement.toDataURL("image/jpeg",0.85);cam.position.copy(s);cam.lookAt(target);return dd;};
    onReady&&onReady(capture);

    let raf, shadowDone=false;
    const loop=()=>{
      if(!shadowDone){rnd.shadowMap.needsUpdate=true;shadowDone=true;}
      if(intro<1){intro=Math.min(1,intro+0.02);const e=1-Math.pow(1-intro,3);r=rRest+(1-e)*rRest*0.6;th=0.62+(1-e)*0.5;}
      if(!drag){th+=vth;ph=Math.max(0.4,Math.min(1.45,ph+vph));vth*=0.92;vph*=0.92;
        if(Math.abs(vth)<0.0004&&intro>=1)th+=0.0012*idleDir;}  // idle lent după ce inerția moare
      if(th>=thMax){th=thMax;idleDir=-1;vth=0;} else if(th<=thMin){th=thMin;idleDir=1;vth=0;}
      upd();rnd.render(scene,cam);raf=requestAnimationFrame(loop);
    };
    loop();
    const onR=()=>{const w=el.clientWidth,h=el.clientHeight;cam.aspect=w/h;cam.updateProjectionMatrix();rnd.setSize(w,h);};
    window.addEventListener("resize",onR);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onR);window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up);rnd.dispose();el.removeChild(rnd.domElement);};
  },[cfg,tip]);
  return (
    <div style={{position:"relative",width:"100%",height:"100%"}}>
      <div ref={mount} style={{width:"100%",height:"100%",touchAction:"none",cursor:"grab"}} />
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 60%, rgba(30,24,16,0.14) 100%)"}} />
    </div>
  );
}
