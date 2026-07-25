// Scena3D MINIMALĂ – doar mobilierul, fără pereți/parchet/covor
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";
import { calculeaza } from "../../utils/calcul.js";

const rad = g => (g * Math.PI) / 180;

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

    
    // --- controale cameră ---
    const target = new THREE.Vector3(0, 1.0, 0);
    let th = 0.6, ph = 1.1, r = 4.5;
    let drag = false, px = 0, py = 0, vth = 0, vph = 0;
    const update = () => {
      cam.position.set(
        target.x + r * Math.sin(ph) * Math.sin(th),
        target.y + r * Math.cos(ph),
        target.z + r * Math.sin(ph) * Math.cos(th)
      );
      cam.lookAt(target);
    };
    
    const dom = renderer.domElement;
    dom.addEventListener("mousedown", e => { drag = true; px = e.clientX; py = e.clientY; vth = 0; vph = 0; });
    window.addEventListener("mousemove", e => {
      if (!drag) return;
      const dx = (e.clientX - px) * 0.008, dy = (e.clientY - py) * 0.008;
      th -= dx; ph -= dy;
      vth = -dx; vph = -dy;
      ph = Math.max(0.4, Math.min(1.4, ph));
      px = e.clientX; py = e.clientY;
    });
    window.addEventListener("mouseup", () => { drag = false; });
    dom.addEventListener("touchstart", e => {
      const t = e.touches[0];
      drag = true; px = t.clientX; py = t.clientY; vth = 0; vph = 0;
    }, { passive: true });
    dom.addEventListener("touchmove", e => {
      if (!drag) return;
      const t = e.touches[0];
      const dx = (t.clientX - px) * 0.008, dy = (t.clientY - py) * 0.008;
      th -= dx; ph -= dy;
      vth = -dx; vph = -dy;
      ph = Math.max(0.4, Math.min(1.4, ph));
      px = t.clientX; py = t.clientY;
    }, { passive: true });
    dom.addEventListener("touchend", () => { drag = false; });
    dom.addEventListener("wheel", e => {
      e.preventDefault();
      r = Math.max(2, Math.min(10, r + e.deltaY * 0.01));
    }, { passive: false });
    
    let raf;
    const loop = () => {
      if (!drag) {
        th += vth * 0.92;
        ph += vph * 0.92;
        vth *= 0.92;
        vph *= 0.92;
        if (Math.abs(vth) < 0.0002) vth = 0;
      }
      update();
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();
    
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", resize);
    
    // Captură pentru formular
    if (onReady) {
      onReady(() => {
        const canvas = renderer.domElement;
        return canvas.toDataURL("image/png");
      });
    }
    
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [cfg, tip]);
  
  return <div ref={mount} style={ width: "100%", height: "100%" } />;
}
