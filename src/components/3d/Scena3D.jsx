// src/Scena3D-v2.jsx — randare "showroom": ACES tone mapping, cameră de
// prezentare cu pereți, umbre de contact, shadow-gaps între fronturi,
// lemn procedural credibil, intro animat + inerție la rotire.
// DROP-IN: același API (cfg, tip, onReady) ca Scena3D.jsx.
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";

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
  for(const cx of [w*0.30,w*0.70]){                       // 2 // eliminat luminoase (structura in reflexii)
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


// ——— plantă showroom: texturi procedurale (cache-uite) ———
function _leafTextureRaw(seedN){
  const c=document.createElement('canvas'); c.width=128; c.height=512;
  const x=c.getContext('2d');
  let s=seedN||1; const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const age=rnd()*0.6 + ((seedN%3===0)?0.35:0);          // unele frunze mai batrane
  // gradient de baza pe lungime
  const g=x.createLinearGradient(0,0,0,512);
  g.addColorStop(0,'#35512d'); g.addColorStop(0.5,'#2c4626'); g.addColorStop(1,'#233a1e');
  x.fillStyle=g; x.fillRect(0,0,128,512);
  // nervura centrala + margini spre inchis
  const vg=x.createLinearGradient(0,0,128,0);
  vg.addColorStop(0,'rgba(40,60,30,0.35)'); vg.addColorStop(0.5,'rgba(125,155,92,0.14)'); vg.addColorStop(1,'rgba(40,60,30,0.35)');
  x.fillStyle=vg; x.fillRect(0,0,128,512);
  // benzi transversale chevron
  for(let i=0;i<28;i++){
    const yy=i*18+rnd()*9, alpha=0.16+rnd()*0.18, amp=7+rnd()*7, ph=rnd()*6.28, hw=6+rnd()*5;
    x.fillStyle=`rgba(152,174,112,${alpha})`; x.beginPath();
    x.moveTo(0, yy+Math.sin(ph)*amp - hw);
    for(let px=0;px<=128;px+=8) x.lineTo(px, yy+Math.sin(px*0.055+ph)*amp - hw);
    for(let px=128;px>=0;px-=8) x.lineTo(px, yy+Math.sin(px*0.055+ph)*amp + hw);
    x.closePath(); x.fill();
  }
  // —— NOU: variegatie galben-verzui pe margini (Sansevieria laurentii), ~1 din 3 frunze ——
  if(seedN%3===0){
    const vint=0.35+rnd()*0.35;
    for(const edge of [0,1]){
      const w=7+rnd()*7, base=edge===0?0:128-w;
      for(let seg=0;seg<40;seg++){
        const yy=seg*13+rnd()*8;
        const mod=0.5+0.5*Math.sin(yy*0.035+edge*2.1);      // variabila pe lungime
        const a=vint*mod*(0.5+rnd()*0.5);
        const gg=x.createLinearGradient(edge===0?0:128,0,edge===0?w:128-w,0);
        gg.addColorStop(0,`rgba(196,198,96,${(a*0.9).toFixed(2)})`);
        gg.addColorStop(1,'rgba(196,198,96,0)');
        x.fillStyle=gg; x.fillRect(base, yy, w, 10+rnd()*8);
      }
    }
  }
  // margini fine mai deschise
  const mg=x.createLinearGradient(0,0,10,0);
  mg.addColorStop(0,'rgba(190,200,130,0.22)'); mg.addColorStop(1,'rgba(190,200,130,0)');
  x.fillStyle=mg; x.fillRect(0,0,10,512);
  const mg2=x.createLinearGradient(118,0,128,0);
  mg2.addColorStop(0,'rgba(190,200,130,0)'); mg2.addColorStop(1,'rgba(190,200,130,0.22)');
  x.fillStyle=mg2; x.fillRect(118,0,10,512);
  // —— NOU: varf uscat maroniu (varful = sus in canvas) ——
  const tipH=52+rnd()*34;
  const tg=x.createLinearGradient(0,0,0,tipH);
  tg.addColorStop(0,`rgba(122,82,42,${(0.5+age*0.38).toFixed(2)})`);
  tg.addColorStop(0.5,'rgba(120,85,45,0.26)');
  tg.addColorStop(1,'rgba(120,85,45,0)');
  x.fillStyle=tg; x.fillRect(0,0,128,tipH);
  for(let i=0;i<6;i++){ const yy=rnd()*tipH*1.25;
    x.fillStyle=`rgba(108,72,38,${(0.14+rnd()*0.16).toFixed(2)})`;
    x.beginPath(); x.ellipse(rnd()*128, yy, 6+rnd()*10, 3+rnd()*5, 0,0,6.28); x.fill(); }
  // —— NOU: AO la baza (baza = jos in canvas), ca sa para infipta ——
  const ao=x.createLinearGradient(0,512,0,512-72);
  ao.addColorStop(0,`rgba(0,0,0,${(0.4+age*0.2).toFixed(2)})`);
  ao.addColorStop(0.45,'rgba(0,0,0,0.16)'); ao.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=ao; x.fillRect(0,512-72,128,72);
  const tx=new THREE.CanvasTexture(c); tx.anisotropy=8; return srgbT(tx);
}
function _terracottaTexRaw(){
  const c=document.createElement('canvas'); c.width=512;c.height=512;
  const x=c.getContext('2d'); let s=42; const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  x.fillStyle='#a85d3e'; x.fillRect(0,0,512,512);
  const g=x.createLinearGradient(0,0,0,512);
  g.addColorStop(0,'rgba(198,128,96,0.35)'); g.addColorStop(0.5,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(58,28,16,0.32)');
  x.fillStyle=g; x.fillRect(0,0,512,512);
  for(let i=0;i<70;i++){ const bx=r()*512,by=r()*512,rr=20+r()*70,dark=r()<0.5;
    const col=dark?'rgba(120,60,38,':'rgba(202,138,98,';
    const gg=x.createRadialGradient(bx,by,0,bx,by,rr);
    gg.addColorStop(0,col+(0.10+r()*0.14).toFixed(2)+')'); gg.addColorStop(1,col+'0)');
    x.fillStyle=gg; x.fillRect(bx-rr,by-rr,2*rr,2*rr); }
  for(let i=0;i<40;i++){ const yy=i*13+r()*6, dk=r()<0.5;                       // inele de roata
    x.strokeStyle=dk?`rgba(88,44,27,${(0.10+r()*0.14).toFixed(2)})`:`rgba(212,152,112,${(0.08+r()*0.12).toFixed(2)})`;
    x.lineWidth=1+r()*2.5; x.beginPath();
    for(let px=0;px<=512;px+=16){ x.lineTo(px, yy+Math.sin(px*0.02+i)*1.5); } x.stroke(); }
  for(let i=0;i<1800;i++){ const v=r(); const c2=v<0.4?'40,22,14':v<0.8?'150,90,60':'212,182,152';
    x.fillStyle=`rgba(${c2},${(0.15+r()*0.3).toFixed(2)})`; x.fillRect(r()*512,r()*512,1+(r()<0.15?1:0),1); }
  for(let i=0;i<14;i++){ const bx=r()*512,w=8+r()*22;                          // urme fine de calcar (discrete)
    const gg=x.createLinearGradient(0,0,0,180); gg.addColorStop(0,`rgba(200,190,175,${(0.10+r()*0.10).toFixed(2)})`); gg.addColorStop(1,'rgba(200,190,175,0)');
    x.fillStyle=gg; x.fillRect(bx,0,w,180); }
  const t=new THREE.CanvasTexture(c); t.anisotropy=8; return srgbT(t);
}
function _terracottaBumpRaw(){
  const c=document.createElement('canvas'); c.width=512;c.height=512;
  const x=c.getContext('2d'); let s=5; const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  x.fillStyle='#808080'; x.fillRect(0,0,512,512);
  for(let i=0;i<40;i++){ const yy=i*13+r()*6, col=r()<0.5?60:200;             // relief inele
    x.strokeStyle=`rgba(${col},${col},${col},0.5)`; x.lineWidth=1+r()*2; x.beginPath();
    for(let px=0;px<=512;px+=16){ x.lineTo(px, yy+Math.sin(px*0.02+i)*1.5); } x.stroke(); }
  for(let i=0;i<1400;i++){ const col=r()<0.5?90:190; x.fillStyle=`rgba(${col},${col},${col},0.3)`; x.fillRect(r()*512,r()*512,1,1); }
  return new THREE.CanvasTexture(c);
}
function _soilTexRaw(){
  const size=512;
  const canvas=document.createElement('canvas'); canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#2a1810'; ctx.fillRect(0,0,size,size);
  const imageData=ctx.getImageData(0,0,size,size); const data=imageData.data;
  function hash(x,y){ let h=x*374761393+y*668265263+1274126177; h=(h^(h>>13))*1274126177; return (h^(h>>16))/2147483648; }
  function layeredNoise(x,y,scales,persistence=0.5){ let value=0,amplitude=1,frequency=1,maxValue=0;
    for(let i=0;i<scales.length;i++){ const freq=frequency*scales[i]; const sx=x*freq,sy=y*freq;
      const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
      const v00=hash(ix,iy),v10=hash(ix+1,iy),v01=hash(ix,iy+1),v11=hash(ix+1,iy+1);
      const a=v00+(v10-v00)*fx,b=v01+(v11-v01)*fx,n=a+(b-a)*fy;
      value+=n*amplitude; maxValue+=amplitude; amplitude*=persistence; frequency*=2; }
    return value/maxValue; }
  const colorPalettes=[{r:65,g:35,b:15},{r:95,g:55,b:25},{r:120,g:70,b:30},{r:140,g:85,b:35},{r:155,g:100,b:40},{r:170,g:110,b:35},{r:180,g:130,b:50},{r:40,g:20,b:8},{r:80,g:45,b:20},{r:110,g:60,b:25}];
  for(let py=0;py<size;py++){ for(let px=0;px<size;px++){ const idx=(py*size+px)*4; const ny=py/size;
    const n1=layeredNoise(px,py,[0.02,0.04,0.08,0.16],0.6), n2=layeredNoise(px,py,[0.1,0.2,0.4,0.8],0.7), n3=layeredNoise(px,py,[0.5,1,2,4],0.8), n4=layeredNoise(px,py,[2,4,8],0.9);
    const moisture=0.3+0.7*(1-ny)*(0.8+0.4*n1); const wetZone=n1>0.6?1.2:(n1<0.3?0.7:1.0); const dryZone=n2>0.7?1.3:1.0;
    let paletteIndex; const combined=n2*0.6+n3*0.3+n1*0.1;
    if(combined<0.2)paletteIndex=7; else if(combined<0.35)paletteIndex=moisture>0.7?0:8; else if(combined<0.5)paletteIndex=moisture>0.6?1:9; else if(combined<0.65)paletteIndex=moisture>0.5?2:3; else if(combined<0.8)paletteIndex=n3>0.6?5:4; else paletteIndex=n3>0.5?6:3;
    if(dryZone>1.2&&paletteIndex<7)paletteIndex=Math.min(paletteIndex+2,6);
    if(wetZone>1.1&&paletteIndex>1)paletteIndex=Math.max(paletteIndex-2,0);
    const baseColor=colorPalettes[paletteIndex]; const grainVar=(n4-0.5)*30;
    let r=baseColor.r+grainVar,g=baseColor.g+grainVar*0.8,b=baseColor.b+grainVar*0.5;
    const rootNoise=layeredNoise(px,py,[0.3,0.6],0.5);
    if(rootNoise>0.85){ const rv=(rootNoise-0.85)*100; r=Math.min(255,r+30+rv); g=Math.min(255,g+20+rv*0.7); b=Math.min(255,b+10+rv*0.5); }
    const cl1=layeredNoise(px,py,[0.15,0.3],0.4), cl2=layeredNoise(px,py,[0.05,0.1],0.3);
    if(cl1>0.75||cl2>0.8){ const dk=(Math.max(cl1,cl2)-0.7)*60; r=Math.max(0,r-dk); g=Math.max(0,g-dk*0.9); b=Math.max(0,b-dk*0.8); }
    const pn=layeredNoise(px,py,[3,6],0.7);
    if(pn>0.92){ const pv=(pn-0.92)*200; r=Math.min(255,r+pv*0.5); g=Math.min(255,g+pv*0.3); b=Math.min(255,b+pv*0.2); }
    data[idx]=Math.max(0,Math.min(255,Math.round(r))); data[idx+1]=Math.max(0,Math.min(255,Math.round(g))); data[idx+2]=Math.max(0,Math.min(255,Math.round(b))); data[idx+3]=255;
  }}
  ctx.putImageData(imageData,0,0);
  for(let i=0;i<15;i++){ const cx=Math.random()*size,cy=Math.random()*size*0.7+size*0.2,radius=20+Math.random()*60;
    const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,radius); gr.addColorStop(0,'rgba(20,10,5,0.4)'); gr.addColorStop(0.5,'rgba(30,15,8,0.2)'); gr.addColorStop(1,'rgba(40,20,10,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fill(); }
  for(let i=0;i<10;i++){ const cx=Math.random()*size,cy=Math.random()*size*0.6,radius=15+Math.random()*40;
    const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,radius); gr.addColorStop(0,'rgba(180,130,50,0.3)'); gr.addColorStop(0.6,'rgba(160,110,40,0.15)'); gr.addColorStop(1,'rgba(140,90,30,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fill(); }
  ctx.strokeStyle='rgba(180,140,80,0.2)'; ctx.lineWidth=0.5;
  for(let i=0;i<30;i++){ const sx=Math.random()*size,sy=Math.random()*size,length=10+Math.random()*40,angle=Math.random()*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(sx,sy); let cx=sx,cy=sy;
    for(let j=0;j<length;j+=5){ cx+=Math.cos(angle+(Math.random()-0.5)*0.5)*3; cy+=Math.sin(angle+(Math.random()-0.5)*0.5)*3; ctx.lineTo(cx,cy);} ctx.stroke(); }
  ctx.strokeStyle='rgba(20,10,5,0.15)'; ctx.lineWidth=0.3;
  for(let i=0;i<20;i++){ const cx=Math.random()*size,cy=Math.random()*size,crackLength=8+Math.random()*25,angle=Math.random()*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    for(let j=0;j<crackLength;j+=3){ const nx=cx+Math.cos(angle)*j+(Math.random()-0.5)*2,nyy=cy+Math.sin(angle)*j+(Math.random()-0.5)*2; ctx.lineTo(nx,nyy);} ctx.stroke(); }
  const t=new THREE.CanvasTexture(canvas); t.anisotropy=8; return srgbT(t);
}
function _soilBumpRaw(){
  const c=document.createElement('canvas'); c.width=512;c.height=512;
  const x=c.getContext('2d'); let s=7; const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  x.fillStyle='#808080'; x.fillRect(0,0,512,512);
  for(let i=0;i<900;i++){
    const bx=rnd()*512,by=rnd()*512,r=2+rnd()*10,col=rnd()<0.5?0:255;
    const g=x.createRadialGradient(bx,by,0,bx,by,r);
    g.addColorStop(0,`rgba(${col},${col},${col},${0.15+rnd()*0.25})`); g.addColorStop(1,`rgba(${col},${col},${col},0)`);
    x.fillStyle=g;x.fillRect(bx-r,by-r,2*r,2*r);
  }
  return new THREE.CanvasTexture(c);
}

const _leafC={}; function leafTexture(s){ return _leafC[s]||(_leafC[s]=_leafTextureRaw(s)); }
let _ttC=null; function terracottaTex(){ return _ttC||(_ttC=_terracottaTexRaw()); }
let _tbC=null; function terracottaBump(){ return _tbC||(_tbC=_terracottaBumpRaw()); }
let _stC=null; function soilTex(){ return _stC||(_stC=_soilTexRaw()); }
let _sbC=null; function soilBump(){ return _sbC||(_sbC=_soilBumpRaw()); }


function matDin(nume){
  const M=C.materialeCorp[nume]||Object.values(C.materialeCorp)[0];
  const ePal=(M.clasa||"").startsWith("pal");
  const eLucios=/lucios/i.test(nume);
  const woodHex = M.tex ? M.tex[0] : ePal ? M.hex : null;
  if(woodHex){
    const pbr=woodPBR(woodHex, _seedFromName(nume), eLucios?0.16:0.42);
    return new THREE.MeshStandardMaterial({
      map:pbr.map, roughnessMap:pbr.roughnessMap, normalMap:pbr.normalMap,
      normalScale:new THREE.Vector2(0.3,0.3),
      roughness:1.0, metalness:0.03, envMapIntensity:eLucios?1.3:0.5,
    });
  }
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(M.hex), roughness:eLucios?0.14:0.4, metalness:0.03, envMapIntensity:eLucios?1.3:0.5,
  });
}

export default function Scena3D({ cfg, tip, onReady }){
  const mount=useRef(null);
  useEffect(()=>{
    const el=mount.current,W=el.clientWidth,Hpx=el.clientHeight;
    const T=C.tipuri[tip], model=C.modeleLayout[cfg.model];
    const { latime,inaltime,adancime,turnuri,materialExt,suspendat,suprapus }=cfg;
    const L=latime/1000,Htot=inaltime/1000,D=adancime/1000,t=0.018;
    const sertarePerTurn=model.sertarePerTurn;
    const suspInalt=suspendat?0.9:0;
    const arePicioare=T.blat && !suspendat;
    const yBaza=(suspendat?suspInalt:(arePicioare?0.08:0.02));
    const Hmain=suprapus?Htot*0.7:Htot;

    // ——— renderer & tone mapping cinematic ———
    const scene=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(38,W/Hpx,0.01,100);
    const rnd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    scene.environment=_envTex(rnd);
    rnd.setPixelRatio(Math.min(window.devicePixelRatio,1.5));rnd.setSize(W,Hpx);
    rnd.shadowMap.enabled=true;rnd.shadowMap.type=THREE.PCFSoftShadowMap;rnd.shadowMap.autoUpdate=false;
    if("outputColorSpace" in rnd) rnd.outputColorSpace=THREE.SRGBColorSpace;
    else rnd.outputEncoding=THREE.sRGBEncoding;
    rnd.toneMapping=THREE.ACESFilmicToneMapping;rnd.toneMappingExposure=1.05;
    el.appendChild(rnd.domElement);

    // ——— „cameră de prezentare”: pereți calzi + parchet + plintă ———
    scene.background=new THREE.Color("#efeae2");
    scene.fog=new THREE.Fog("#efeae2",8,22);
    const matPerete=new THREE.MeshStandardMaterial({color:"#eee8de",roughness:0.96});
    const matPerete2=new THREE.MeshStandardMaterial({color:"#e7e0d4",roughness:0.96});
    const perete=new THREE.Mesh(new THREE.PlaneGeometry(30,10),matPerete);
    perete.position.set(0,5,-D/2-0.03);perete.receiveShadow=true;scene.add(perete);
    const pereteL=new THREE.Mesh(new THREE.PlaneGeometry(30,10),matPerete2);
    pereteL.rotation.y=Math.PI/2;pereteL.position.set(-Math.max(3,L*1.6),5,0);pereteL.receiveShadow=true;scene.add(pereteL);
    const tavan=new THREE.Mesh(new THREE.PlaneGeometry(30,30),
      new THREE.MeshStandardMaterial({color:"#f2ede4",roughness:0.98}));
    tavan.rotation.x=Math.PI/2;tavan.position.y=Math.max(2.9,Htot+0.5);scene.add(tavan);
    const plinta=new THREE.Mesh(new THREE.BoxGeometry(30,0.09,0.012),new THREE.MeshStandardMaterial({color:"#dcd5c8",roughness:0.8}));
    plinta.position.set(0,0.045,-D/2-0.02);scene.add(plinta);
    // // eliminat vizibila pe peretele din spate (lumina in cadru)
    const _fram=new THREE.Mesh(new THREE.PlaneGeometry(1.36,1.56),_fm);_fram.position.set(0,_wy,_wz);const _win=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.4),new THREE.MeshBasicMaterial({color:"#fff4e6"}));_win.position.set(0,_wy,_wz+0.004);const _bV=new THREE.Mesh(new THREE.BoxGeometry(0.035,1.4,0.02),_fm);_bV.position.set(0,_wy,_wz+0.012);const _bH=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.035,0.02),_fm);_bH.position.set(0,_wy,_wz+0.012);// parchet: dungi late discrete (cached)
    const ptx=_parchetTex();
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({map:ptx,roughness:0.42,metalness:0.06,envMapIntensity:0.6}));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    // covor sub mobilier (ancoreaza piesa in camera)
    const covor=new THREE.Mesh(new THREE.PlaneGeometry(L*1.5+0.6,D*1.7),
      new THREE.MeshStandardMaterial({color:"#cbb9a0",roughness:1}));
    covor.rotation.x=-Math.PI/2;covor.position.set(0,0.006,D*0.55);covor.receiveShadow=true;scene.add(covor);
    const covorB=new THREE.Mesh(new THREE.PlaneGeometry(L*1.5+0.75,D*1.7+0.15),
      new THREE.MeshStandardMaterial({color:"#b7a389",roughness:1}));
    covorB.rotation.x=-Math.PI/2;covorB.position.set(0,0.004,D*0.55);covorB.receiveShadow=true;scene.add(covorB);
    // sansevieria in ghiveci teracota (planta de showroom) — portat din preview
    if(tip!=="baie"){ const gx=L/2+0.85, gz=D/2+0.75;
      const matCeramica=new THREE.MeshStandardMaterial({map:terracottaTex(), bumpMap:terracottaBump(), bumpScale:0.0015, roughness:0.85, metalness:0});
      const ghiveci=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.115,0.3,48),matCeramica);
      ghiveci.position.set(gx,0.15,gz); ghiveci.castShadow=true; scene.add(ghiveci);
      const buza=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.014,12,48),matCeramica);
      buza.rotation.x=Math.PI/2; buza.position.set(gx,0.30,gz); scene.add(buza);
      (function(){
        const R=0.145, surf=0.305;
        const noise=(x,z)=>Math.sin(x*37.1+z*11.7)*0.5+Math.sin(x*13.3-z*29.2)*0.35+Math.sin(x*61.7+z*47.3)*0.15;
        const geo=new THREE.CircleGeometry(R,72); const pos=geo.attributes.position;
        for(let i=0;i<pos.count;i++){ const px=pos.getX(i),py=pos.getY(i),rr=Math.sqrt(px*px+py*py)/R;
          const dome=(1-rr*rr)*0.006, lump=noise(px*60,py*60)*0.0022*(0.4+rr); pos.setZ(i,dome+lump); }
        geo.computeVertexNormals();
        let soilMat; try { soilMat=new THREE.MeshStandardMaterial({color:"#b3b3b3", map:soilTex(), bumpMap:soilBump(), bumpScale:0.004, roughness:0.96, metalness:0}); }
        catch(e){ soilMat=new THREE.MeshStandardMaterial({color:"#33240f", roughness:0.96, metalness:0}); }
        const soil=new THREE.Mesh(geo,soilMat); soil.rotation.x=-Math.PI/2; soil.position.set(gx,surf,gz); soil.receiveShadow=true; scene.add(soil);
        const rs=(n)=>{let s=n;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}; const q=rs(23);
        const surfAt=(x,z)=>surf+(1-((x*x+z*z)/(R*R)))*0.006;
        for(let i=0;i<24;i++){ const a=q()*6.28,d=q()*0.10,x=Math.cos(a)*d,z=Math.sin(a)*d,k=q(); let m;
          if(k<0.09){ m=new THREE.Mesh(new THREE.SphereGeometry(0.003+q()*0.0025,6,6), new THREE.MeshStandardMaterial({color:"#8f8472",roughness:0.95})); }
          else if(k<0.4){ m=new THREE.Mesh(new THREE.BoxGeometry(0.010+q()*0.014,0.004,0.006), new THREE.MeshStandardMaterial({color:"#2c1f14",roughness:0.85})); m.rotation.y=q()*6.28; }
          else { m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.005+q()*0.006,0), new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.07,0.22,0.12+q()*0.10),roughness:0.85})); m.rotation.set(q()*6.28,q()*6.28,q()*6.28); }
          m.position.set(gx+x, surfAt(x,z)+0.004, gz+z); m.castShadow=true; m.receiveShadow=true; scene.add(m);
        }
      })();
      const seedF=(n)=>{let s=n;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}; const rnd2=seedF(7);
      for(let i=0;i<9;i++){ const ang=(i/9)*Math.PI*2+rnd2()*0.5, dist=0.008+rnd2()*0.032, hF=0.45+rnd2()*0.5;
        const geo=new THREE.ConeGeometry(0.045,hF,6); geo.translate(0,hF/2,0);
        const leaf=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({map:leafTexture(i*131+7),roughness:0.55,metalness:0.0}));
        leaf.scale.z=0.16; leaf.position.set(gx+Math.cos(ang)*dist, 0.29, gz+Math.sin(ang)*dist);
        leaf.rotation.y=ang+rnd2()*0.8; const tilt=0.05+rnd2()*0.17;
        leaf.rotation.x=Math.sin(ang)*tilt; leaf.rotation.z=-Math.cos(ang)*tilt; leaf.castShadow=true; scene.add(leaf);
      }
    }

    // umbra de contact
    const uc=new THREE.Mesh(new THREE.PlaneGeometry(L*1.7,D*2.4),new THREE.MeshBasicMaterial({map:umbraContact(),transparent:true,depthWrite:false}));
    uc.rotation.x=-Math.PI/2;uc.position.y=0.008;scene.add(uc);

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
    const matSticla=new THREE.MeshPhysicalMaterial({color:0xd7e8ec,roughness:0.05,metalness:0,transparent:true,opacity:0.16,clearcoat:1});
    const g=new THREE.Group();
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
        // vitrina: polite interioare vizibile prin // eliminat + usa cu rama din material
        for(let r=1;r<=2;r++) box(latTurn,t,D-0.04,xc,yUsiJos+(usiH/3)*r,0);
        const fw=Math.min(0.055,latTurn*0.16),gw=latTurn-2*gap,gh=usiH-2*gap,yC=yUsiJos+usiH/2;
        box(gw,fw,0.018,xc,yUsiJos+usiH-gap-fw/2,frontZ);
        box(gw,fw,0.018,xc,yUsiJos+gap+fw/2,frontZ);
        box(fw,gh-2*fw,0.018,xc-gw/2+fw/2,yC,frontZ);
        box(fw,gh-2*fw,0.018,xc+gw/2-fw/2,yC,frontZ);
        box(gw-2*fw,gh-2*fw,0.006,xc,yC,frontZ-0.004,matSticla);
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
