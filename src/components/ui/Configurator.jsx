// Configurator.jsx — VERSIUNE DE TESTARE (afișează erori)
import React, { useState } from "react";
import { CONFIG_TAMPLAR as C } from "../../config/CONFIG.js";
import { calculeaza, umRegula } from "../../utils/calcul.js";
import Scena3D from "../3d/Scena3D.jsx";
import Formular from "../ui/Formular.jsx";
import Bucatarie from "../3d/Bucatarie.jsx";

const DISPLAY = "'Fraunces',Georgia,serif";
const lei = n => Math.round(n).toLocaleString("ro-RO") + " lei";

function ErrorDisplay({ error, tip, inapoi }) {
  return (
    <div style={{ padding: 40, background: "#fff3f0", border: "2px solid #e74c3c", margin: 20, borderRadius: 8 }}>
      <h2 style={{ color: "#c0392b" }}>❌ EROARE ÎN CONFIG</h2>
      <p><strong>Tip:</strong> {tip}</p>
      <p><strong>Mesaj:</strong> {error.message}</p>
      <details style={{ fontSize: 13, marginTop: 10, background: "#fefefe", padding: 10, borderRadius: 4 }}>
        <summary>Detalii tehnice</summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{error.stack}</pre>
      </details>
      <button onClick={inapoi} style={{ marginTop: 16, padding: "8px 16px", background: "#a37e4a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Înapoi</button>
    </div>
  );
}

export default function Configurator() {
  const [tip, setTip] = useState(null);
  const [error, setError] = useState(null);

  if (error) {
    return <ErrorDisplay error={error} tip={tip} inapoi={() => { setError(null); setTip(null); }} />;
  }

  if (!tip) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>Selector</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.keys(C.tipuri).map((k) => (
            <button
              key={k}
              onClick={() => {
                try {
                  setTip(k);
                } catch (err) {
                  setError(err);
                }
              }}
              style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", fontSize: 16 }}
            >
              {k}
            </button>
          ))}
          <button
            onClick={() => {
              try {
                setTip("bucatarie");
              } catch (err) {
                setError(err);
              }
            }}
            style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", fontSize: 16 }}
          >
            Bucătărie
          </button>
        </div>
      </div>
    );
  }

  try {
    if (tip === "bucatarie") {
      return <Bucatarie inapoi={() => setTip(null)} />;
    }
    const Config = require("./Config.jsx"); // Dynamic import pentru a prinde erori
    return <Config tip={tip} inapoi={() => setTip(null)} />;
  } catch (err) {
    return <ErrorDisplay error={err} tip={tip} inapoi={() => { setTip(null); }} />;
  }
}
