import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";

// Scenă 3D pentru bucătărie: înșiruie corpuri-bază pe un perete, cu blat continuu
// deasupra. corpuri = array de chei din C.bucatarie.corpuriBaza.
// API: <ScenaBucatarie corpuri={["sertare","usi2",...]} culoareFront onReady/>

export default function ScenaBucatarie({ corpuri, culoareFront = "#e8e4dd", culoareBlat = "#3a3632", suspendate = true, onReady }) {
  const mount = useRef(null);
  const sceneRef = useRef(null), contentRef = useRef(null), camState = useRef(null), rndRef = useRef(null);

  // setup o singură dată
  useEffect(() => {
    const el = mount.current; if (!el) return;
    const scene = new THREE.Scene(); sceneRef.current = scene;
    scene.background = new THREE.Color("#efece7");

    const cam = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 100);
    const S = { theta: -0.6, phi: 1.15, r: 5.5, target: new THREE.Vector3(0, 0.9, 0) };
    camState.current = S;

    const rnd = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rnd.setSize(el.clientWidth, el.clientHeight);
    rnd.setPixelRatio(Math.min(2, window.devicePixelRatio));
    rnd.shadowMap.enabled = true; rnd.shadowMap.type = THREE.PCFSoftShadowMap;
    rnd.toneMapping = THREE.ACESFilmicToneMapping; rnd.toneMappingExposure = 1.05;
    rndRef.current = rnd;
    el.appendChild(rnd.domElement);

    // lumini
    scene.add(new THREE.HemisphereLight(0xfff6ea, 0xb8ae9f, 0.5));
    const key = new THREE.DirectionalLight(0xffeeda, 2.0);
    key.position.set(3, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536); key.shadow.camera.near = 0.5; key.shadow.camera.far = 30;
    key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0004; scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.3); fill.position.set(-3, 2, 2); scene.add(fill);

    // podea
    const podea = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.95 }));
    podea.rotation.x = -Math.PI / 2; podea.receiveShadow = true; scene.add(podea);
    // perete în spate
    const perete = new THREE.Mesh(new THREE.PlaneGeometry(40, 12),
      new THREE.MeshStandardMaterial({ color: 0xeae4da, roughness: 1 }));
    perete.position.set(0, 6, -0.62); perete.receiveShadow = true; scene.add(perete);

    // interacțiune: drag rotire + wheel zoom
    let drag = false, px = 0, py = 0;
    const onDown = e => { drag = true; px = e.clientX; py = e.clientY; };
    const onUp = () => drag = false;
    const onMove = e => {
      if (!drag) return;
      S.theta -= (e.clientX - px) * 0.008; S.phi = Math.max(0.35, Math.min(1.4, S.phi - (e.clientY - py) * 0.006));
      px = e.clientX; py = e.clientY;
    };
    const onWheel = e => { e.preventDefault(); S.r = Math.max(2.5, Math.min(11, S.r + e.deltaY * 0.004)); };
    rnd.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp); window.addEventListener("mousemove", onMove);
    rnd.domElement.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      if (!el) return; cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix();
      rnd.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf;
    const loop = () => {
      const st = camState.current;
      cam.position.set(
        st.target.x + st.r * Math.sin(st.phi) * Math.sin(st.theta),
        st.target.y + st.r * Math.cos(st.phi),
        st.target.z + st.r * Math.sin(st.phi) * Math.cos(st.theta)
      );
      cam.lookAt(st.target);
      rnd.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    if (onReady) onReady(() => rnd.domElement.toDataURL("image/png"));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize); window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      rnd.dispose(); if (rnd.domElement.parentNode === el) el.removeChild(rnd.domElement);
    };
  }, []);

  // reconstruiește corpurile când se schimbă lista
  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return;
    const rebuild = () => {
      if (contentRef.current) { scene.remove(contentRef.current); disposeGroup(contentRef.current); }
      const g = buildBucatarie(corpuri, culoareFront, culoareBlat, suspendate);
      scene.add(g); contentRef.current = g;
      const S = camState.current;
      if (S) { S.target.set(0, 1.15, 0); S.r = Math.max(4, (g.userData.latimeTotala || 3) * 1.1 + 1.5); }
    };
    const id = setTimeout(rebuild, 60);
    return () => clearTimeout(id);
  }, [JSON.stringify(corpuri), culoareFront, culoareBlat, suspendate]);

  return <div ref={mount} style={{ width: "100%", height: "100%" }} />;
}

// ——— construcția bucătăriei ———
function buildBucatarie(corpuri, culoareFront, culoareBlat, suspendate = true) {
  const g = new THREE.Group();
  const cat = C.bucatarie.corpuriBaza;
  const Hb = (C.bucatarie.inaltimeBaza || 850) / 1000;
  const Db = (C.bucatarie.adancimeBaza || 600) / 1000;
  const gBlat = (C.bucatarie.grosimeBlat || 40) / 1000;
  const t = 0.018;

  const lista = (corpuri && corpuri.length ? corpuri : ["sertare"]).map(k => cat[k]).filter(Boolean);
  const latTot = lista.reduce((s, c) => s + c.latime / 1000, 0);
  g.userData.latimeTotala = latTot;

  const matCorp = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7 });
  const matFront = new THREE.MeshStandardMaterial({ color: new THREE.Color(culoareFront), roughness: 0.5, metalness: 0.02 });
  const matBlat = new THREE.MeshStandardMaterial({ color: new THREE.Color(culoareBlat), roughness: 0.35, metalness: 0.05 });
  const matMet = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.9 });
  const matInox = new THREE.MeshStandardMaterial({ color: 0xc8ccce, roughness: 0.25, metalness: 0.85 });

  const box = (w, h, d, x, y, z, m) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || matCorp);
    me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; g.add(me); return me;
  };

  let x = -latTot / 2; // pornim din stânga
  for (const c of lista) {
    const w = c.latime / 1000;
    const xc = x + w / 2;
    const frontZ = Db / 2 + 0.004;

    // carcasa (spate + laterale + fund) sugerată simplu: o cutie
    box(w, Hb, Db, xc, Hb / 2, 0, matCorp);

    // frontul, în funcție de tip
    if (c.tip === "sertare") {
      for (let s = 0; s < 3; s++) {
        const sh = Hb / 3, yc = sh / 2 + s * sh;
        box(w - 0.03, sh - 0.02, 0.018, xc, yc, frontZ, matFront);
        // mâner bară
        box(Math.min(0.3, w * 0.5), 0.012, 0.02, xc, yc + sh / 2 - 0.03, frontZ + 0.012, matMet);
      }
    } else if (c.tip === "usi") {
      const nu = w > 0.5 ? 2 : 1, uw = (w - 0.03) / nu;
      for (let u = 0; u < nu; u++) {
        const ux = xc - w / 2 + 0.015 + uw / 2 + u * uw;
        box(uw - 0.01, Hb - 0.03, 0.018, ux, Hb / 2, frontZ, matFront);
        const hSide = nu === 2 ? (u === 0 ? 1 : -1) : 1;
        box(0.012, Math.min(0.5, Hb * 0.6), 0.02, ux + hSide * (uw / 2 - 0.03), Hb / 2, frontZ + 0.012, matMet);
      }
    } else if (c.tip === "chiuveta") {
      // uși jos + chiuvetă inox deasupra (în blat, desenată la nivelul blatului)
      box(w - 0.03, Hb - 0.03, 0.018, xc, Hb / 2, frontZ, matFront);
      // bazinul chiuvetei (cutie inox scobită sugerată)
      const baz = box(w * 0.6, 0.12, Db * 0.55, xc, Hb + gBlat - 0.06, 0.02, matInox);
    } else if (c.tip === "cuptor") {
      // cuptor (cutie neagră cu ușă sticlă) + sertar jos
      box(w - 0.03, Hb * 0.55, 0.02, xc, Hb * 0.6, frontZ, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 }));
      box(w - 0.06, Hb * 0.4, 0.006, xc, Hb * 0.6, frontZ + 0.006, new THREE.MeshStandardMaterial({ color: 0x2e3438, roughness: 0.15, metalness: 0.3 }));
      box(w - 0.03, Hb * 0.3, 0.018, xc, Hb * 0.18, frontZ, matFront);
    } else if (c.tip === "frigider") {
      // frigider înalt (depășește blatul) — două uși inox
      const Hf = Hb + gBlat + 0.7;
      box(w - 0.02, Hf, Db, xc, Hf / 2, 0, matInox);
      // linie de separație uși + mânere verticale
      box(w - 0.04, 0.006, 0.006, xc, Hf * 0.62, frontZ, matMet);
      box(0.02, 0.5, 0.02, xc - w / 2 + 0.06, Hf * 0.35, frontZ, matMet);
      box(0.02, 0.3, 0.02, xc - w / 2 + 0.06, Hf * 0.8, frontZ, matMet);
    } else if (c.tip === "plita") {
      // corp jos cu sertar + plită neagră în blat + hotă deasupra
      box(w - 0.03, Hb - 0.03, 0.018, xc, Hb / 2, frontZ, matFront);
      const plita = box(w * 0.85, 0.02, Db * 0.7, xc, Hb + gBlat + 0.011, 0.02,
        new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.2, metalness: 0.4 }));
      // 4 arzătoare (cercuri sugerați prin cilindri joși)
      for (const [ox, oz] of [[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.12], [0.15, 0.12]]) {
        const arz = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.004, 20),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.5 }));
        arz.position.set(xc + ox, Hb + gBlat + 0.023, 0.02 + oz); g.add(arz);
      }
      // hotă suspendată deasupra
      const hota = box(w * 0.9, 0.12, Db * 0.6, xc, Hb + gBlat + 0.75, 0.05, matInox);
      box(w * 0.35, 0.35, 0.1, xc, Hb + gBlat + 0.95, -0.1, matInox); // coș hotă
    } else if (c.tip === "masina") {
      // mașină vase — front inox cu panou de comandă sus
      box(w - 0.03, Hb - 0.03, 0.018, xc, Hb / 2, frontZ, matInox);
      box(w - 0.06, 0.05, 0.006, xc, Hb - 0.06, frontZ + 0.006,
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 }));
      box(0.15, 0.02, 0.02, xc, Hb - 0.14, frontZ + 0.012, matMet); // mâner bară
    } else if (c.tip === "colt") {
      // corp de colț: doar carcasă + o ușă îngustă pe diagonală (sugestie)
      box(w - 0.03, Hb - 0.03, 0.018, xc, Hb / 2, frontZ, matFront);
    }

    x += w;
  }

  // blat continuu — dar întrerupt de electrocasnicele înalte (frigider).
  // Desenăm segmente de blat între frigidere, peste corpurile joase.
  if (latTot > 0) {
    let segStart = -latTot / 2, cursor = -latTot / 2;
    const inchideSegment = (end) => {
      if (end - segStart > 0.05) {
        const segW = end - segStart;
        box(segW + 0.02, gBlat, Db + 0.02, segStart + segW / 2, Hb + gBlat / 2, 0, matBlat);
      }
    };
    for (const c of lista) {
      const w = c.latime / 1000;
      if (c.tip === "frigider") { inchideSegment(cursor); segStart = cursor + w; }
      cursor += w;
    }
    inchideSegment(latTot / 2);
  }

  // CORPURI SUSPENDATE: dulăpioare sus, pe perete, deasupra corpurilor joase.
  // Nu peste frigider (deja înalt) și nu peste plită (acolo e hota).
  if (suspendate) {
    const ySus = Hb + gBlat + 0.55;      // spațiul de faianță între blat și sus
    const Hsus = 0.72, Dsus = Db * 0.62; // corpuri sus mai puțin adânci
    let cx = -latTot / 2;
    for (const c of lista) {
      const w = c.latime / 1000;
      const xc = cx + w / 2;
      const areSus = c.tip !== "frigider" && c.tip !== "plita" && c.tip !== "colt";
      if (areSus) {
        const fz = Dsus / 2 + 0.004;
        // carcasă sus
        box(w - 0.02, Hsus, Dsus, xc, ySus + Hsus / 2, -(Db - Dsus) / 2, matCorp);
        // uși sus (1-2)
        const nu = w > 0.5 ? 2 : 1, uw = (w - 0.03) / nu;
        for (let u = 0; u < nu; u++) {
          const ux = xc - w / 2 + 0.015 + uw / 2 + u * uw;
          box(uw - 0.01, Hsus - 0.02, 0.018, ux, ySus + Hsus / 2, -(Db - Dsus) / 2 + fz, matFront);
          const hSide = nu === 2 ? (u === 0 ? 1 : -1) : 1;
          box(0.012, 0.12, 0.02, ux + hSide * (uw / 2 - 0.03), ySus + 0.08, -(Db - Dsus) / 2 + fz + 0.012, matMet);
        }
      }
      cx += w;
    }
  }

  return g;
}

function disposeGroup(grp) {
  grp.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) { const m = Array.isArray(o.material) ? o.material : [o.material]; m.forEach(x => x.dispose()); }
  });
}
