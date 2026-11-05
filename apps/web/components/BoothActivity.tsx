"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/device";

const btn: React.CSSProperties = { border: 0, borderRadius: 14, padding: "12px 16px", fontWeight: 700, fontSize: 15, cursor: "pointer", minHeight: 44 };
const pri: React.CSSProperties = { ...btn, background: "var(--indigo,#4353A2)", color: "#fff" };
const sec: React.CSSProperties = { ...btn, background: "#fff", color: "var(--indigo,#4353A2)", boxShadow: "inset 0 0 0 1.5px var(--line,#ddd)" };


/* ---------- Bhasha: name in Devanagari ---------- */
const VOW: Record<string, [string, string]> = { a: ["अ", ""], aa: ["आ", "ा"], i: ["इ", "ि"], ee: ["ई", "ी"], u: ["उ", "ु"], oo: ["ऊ", "ू"], e: ["ए", "े"], ai: ["ऐ", "ै"], o: ["ओ", "ो"], au: ["औ", "ौ"] };
const CON: Record<string, string> = { kh: "ख", gh: "घ", ch: "च", chh: "छ", jh: "झ", th: "थ", dh: "ध", ph: "फ", bh: "भ", sh: "श", k: "क", g: "ग", j: "ज", t: "ट", d: "ड", n: "न", p: "प", b: "ब", m: "म", y: "य", r: "र", l: "ल", v: "व", w: "व", s: "स", h: "ह", f: "फ", z: "ज", q: "क", x: "क्स", c: "क" };
export function toDevanagari(word: string): string {
  const s = word.toLowerCase().replace(/[^a-z]/g, "").replace(/i$/, "ee").replace(/y$/, "ee"); let out = ""; let i = 0; let prevCon = false;
  const vowKeys = ["aa", "ee", "oo", "ai", "au", "a", "i", "u", "e", "o"]; const conKeys = ["chh", "kh", "gh", "ch", "jh", "th", "dh", "ph", "bh", "sh", "k", "g", "j", "t", "d", "n", "p", "b", "m", "y", "r", "l", "v", "w", "s", "h", "f", "z", "q", "x", "c"];
  while (i < s.length) {
    const v = vowKeys.find((k) => s.startsWith(k, i));
    const c = conKeys.find((k) => s.startsWith(k, i));
    if (v && (!c || vowKeys.includes(s[i]))) { const isV = vowKeys.find((k) => s.startsWith(k, i)); if (isV) { out += prevCon ? VOW[isV][1] : VOW[isV][0]; prevCon = false; i += isV.length; continue; } }
    if (c) { out += CON[c]; prevCon = true; i += c.length; if (i >= s.length) break; if (!vowKeys.some((k) => s.startsWith(k, i))) out += "्"; continue; }
    i++;
  }
  return out;
}
function Bhasha() {
  const [name, setName] = useState(""); const dev = name.trim() ? name.trim().split(/\s+/).map(toDevanagari).join(" ") : "";
  const hear = () => { try { const u = new SpeechSynthesisUtterance(dev || name); u.lang = "hi-IN"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {} };
  const save = () => {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1080; const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, "#4353A2"); g.addColorStop(1, "#71318E"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = "#FBB927"; x.fillRect(0, 0, 1080, 18); x.textAlign = "center"; x.fillStyle = "#fff";
    x.font = "600 40px Montserrat, sans-serif"; x.fillText("BAPS PHOENIX · DIWALI 2026", 540, 150);
    x.font = "700 200px 'Noto Sans Devanagari', sans-serif"; x.fillText(dev, 540, 560, 960);
    x.font = "500 56px Montserrat, sans-serif"; x.fillStyle = "#FBB927"; x.fillText(name.trim(), 540, 700, 960);
    x.fillStyle = "#fff"; x.font = "500 36px Montserrat, sans-serif"; x.fillText("Light Beyond Lamps", 540, 980);
    c.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "my-name.png"; a.click(); track("made_moment"); });
  };
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
    <input value={name} onChange={(e) => setName(e.target.value.slice(0, 30))} placeholder="Type your name" aria-label="Your name" style={{ font: "inherit", fontSize: 18, padding: 14, borderRadius: 14, border: "1.5px solid var(--line,#ddd)" }} />
    <div className="ctr" style={{ fontSize: 56, fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: 700, color: "#4353A2", minHeight: 80, lineHeight: 1.3 }} lang="hi">{dev || "नाम"}</div>
    <p style={{ fontSize: 12, opacity: .7 }}>A simple sound-based spelling. Ask a volunteer for the traditional spelling of your name.</p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button style={sec} onClick={hear} disabled={!dev}>Hear it</button><button style={pri} onClick={save} disabled={!dev}>Save card</button></div>
  </div>);
}

/* ---------- Bhusha: selfie + outfit frame ---------- */
const OCC = [["Wedding", "#C2557F"], ["Festival", "#FBB927"], ["Puja", "#4353A2"], ["Everyday", "#0E8C7F"]] as const;
function Bhusha() {
  const [occ, setOcc] = useState<number>(1); const [img, setImg] = useState<HTMLImageElement | null>(null); const cv = useRef<HTMLCanvasElement>(null);
  const pick = (f?: File | null) => { if (!f) return; const im = new Image(); im.onload = () => setImg(im); im.src = URL.createObjectURL(f); };
  useEffect(() => {
    const c = cv.current; if (!c) return; const x = c.getContext("2d")!; c.width = 800; c.height = 800; x.fillStyle = "#F4EFF3"; x.fillRect(0, 0, 800, 800);
    if (img) { const s = Math.max(800 / img.width, 800 / img.height); x.drawImage(img, (800 - img.width * s) / 2, (800 - img.height * s) / 2, img.width * s, img.height * s); }
    const col = OCC[occ][1]; x.lineWidth = 36; x.strokeStyle = col; x.strokeRect(18, 18, 764, 764);
    x.fillStyle = col; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(40 + i * 65, 40, 22, 0, Math.PI); x.fill(); }
    x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(0, 700, 800, 100); x.fillStyle = "#fff"; x.font = "700 40px Montserrat, sans-serif"; x.textAlign = "center"; x.fillText(`${OCC[occ][0]} look · Diwali 2026`, 400, 762);
  }, [img, occ]);
  const save = () => cv.current?.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "my-look.png"; a.click(); track("made_moment"); });
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
    <div className="cols2" style={{ alignItems: "center" }}>
      <canvas ref={cv} style={{ width: "100%", borderRadius: 14, aspectRatio: "1" }} aria-label="Preview" />
      <div style={{ display: "grid", gap: 12 }}>
        <div className="eb">Occasion</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{OCC.map((o, i) => <button key={o[0]} onClick={() => setOcc(i)} style={{ ...sec, ...(i === occ ? { background: o[1], color: "#fff" } : {}) }}>{o[0]}</button>)}</div>
        <label style={{ ...pri, textAlign: "center", display: "block" }}>Take or choose a selfie<input type="file" accept="image/*" capture="user" hidden onChange={(e) => pick(e.target.files?.[0])} /></label>
        <button style={sec} onClick={save} disabled={!img}>Save picture</button>
        <p style={{ fontSize: 12, opacity: .7 }}>Your photo stays on this phone. It is never uploaded.</p>
      </div>
    </div>
  </div>);
}

/* ---------- Bhojan: thali ---------- */
const DISHES = [["Puri", "🫓"], ["Shrikhand", "🍨"], ["Dal", "🍲"], ["Rice", "🍚"], ["Shaak", "🥘"], ["Kadhi", "🥣"], ["Farsan", "🥨"], ["Laddu", "🟠"], ["Papad", "⭕"], ["Salad", "🥗"]] as const;
function Bhojan() {
  const [sel, setSel] = useState<string[]>([]); const tog = (d: string) => setSel((s) => s.includes(d) ? s.filter((x) => x !== d) : [...s, d]);
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>{DISHES.map(([d, e]) => { const on = sel.includes(d); return <button key={d} aria-pressed={on} onClick={() => tog(d)} style={{ ...sec, display: "grid", gap: 4, padding: 12, background: on ? "#FBE9F0" : "#fff", boxShadow: on ? "inset 0 0 0 2px #C2557F" : sec.boxShadow }}><span style={{ fontSize: 30 }}>{e}</span><span>{d}</span></button>; })}</div>
    <div className="ctr" style={{ fontWeight: 600 }}>{sel.length === 0 ? "Your plate is empty" : `Your thali has ${sel.length} item${sel.length > 1 ? "s" : ""}: ${sel.join(", ")}`}</div>
    <p style={{ fontSize: 12, opacity: .7 }}>Annakut means “mountain of food” offered to God. Every dish is first offered, then shared as prasad.</p>
  </div>);
}

/* ---------- Arts: tabla pads ---------- */
const PADS = [["Dha", 110], ["Dhin", 147], ["Na", 220], ["Tin", 262], ["Ge", 82], ["Ta", 330]] as const;
function Arts() {
  const ac = useRef<AudioContext | null>(null); const rec = useRef<{ i: number; t: number }[]>([]); const t0 = useRef(0); const [recording, setRecording] = useState(false); const [has, setHas] = useState(false); const [left, setLeft] = useState(15);
  const play = (i: number) => {
    const A = ac.current ??= new (window.AudioContext || (window as any).webkitAudioContext)(); const f = PADS[i][1]; const o = A.createOscillator(); const g = A.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(f * 1.8, A.currentTime); o.frequency.exponentialRampToValueAtTime(f, A.currentTime + .08); g.gain.setValueAtTime(.9, A.currentTime); g.gain.exponentialRampToValueAtTime(.001, A.currentTime + .5); o.connect(g).connect(A.destination); o.start(); o.stop(A.currentTime + .55);
  };
  const tap = (i: number) => { play(i); if (recording) { rec.current.push({ i, t: performance.now() - t0.current }); } };
  const start = () => { rec.current = []; t0.current = performance.now(); setRecording(true); setHas(false); setLeft(15); };
  useEffect(() => { if (!recording) return; const id = setInterval(() => { const l = 15 - Math.floor((performance.now() - t0.current) / 1000); setLeft(Math.max(l, 0)); if (l <= 0) { setRecording(false); setHas(rec.current.length > 0); } }, 250); return () => clearInterval(id); }, [recording]);
  const stop = () => { setRecording(false); setHas(rec.current.length > 0); };
  const replay = () => rec.current.forEach((r) => setTimeout(() => play(r.i), r.t));
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>{PADS.map(([n], i) => <button key={n} onPointerDown={() => tap(i)} style={{ ...btn, background: "#0E8C7F", color: "#fff", height: 84, fontSize: 18, touchAction: "manipulation" }}>{n}</button>)}</div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {!recording ? <button style={pri} onClick={start}>Record</button> : <button style={{ ...pri, background: "#C0392B" }} onClick={stop}>Stop · {left}s</button>}
      <button style={sec} onClick={replay} disabled={!has}>Play back</button>
    </div>
    <p style={{ fontSize: 12, opacity: .7 }}>Recording stays on this phone. Up to 15 seconds.</p>
  </div>);
}

/* ---------- Festivals: five diyas in order ---------- */
const FEST = ["Dhanteras", "Kali Chaudas", "Diwali", "Annakut", "Bhai Beej"];
function Festivals() {
  const [n, setN] = useState(0); const [miss, setMiss] = useState<number | null>(null);
  const tap = (i: number) => { if (i === n) { setN(n + 1); setMiss(null); } else { setMiss(i); setTimeout(() => setMiss(null), 500); } };
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>{FEST.map((f, i) => <button key={f} onClick={() => tap(i)} aria-label={`Diya ${i + 1}`} style={{ ...btn, background: i < n ? "#FFF3D1" : "#fff", boxShadow: miss === i ? "inset 0 0 0 2px #C0392B" : "inset 0 0 0 1.5px var(--line,#ddd)", display: "grid", gap: 4, padding: "14px 4px" }}><span style={{ fontSize: 34, filter: i < n ? "none" : "grayscale(1) opacity(.5)" }}>🪔</span><span style={{ fontSize: 11 }}>{i < n ? f : i + 1}</span></button>)}</div>
    <div className="ctr" style={{ fontWeight: 600 }}>{n >= 5 ? "All five days lit. Shubh Deepavali!" : `Tap diya ${n + 1}`}</div>
    {n > 0 && <button style={sec} onClick={() => setN(0)}>Start again</button>}
  </div>);
}

/* ---------- Spirituality: pick a value ---------- */
const VALUES = [["Seva", "Serving others without expecting anything back."], ["Satsang", "Staying close to good company and community."], ["Gratitude", "Remembering what we already have."], ["Humility", "Learning from everyone we meet."], ["Unity", "Standing together as one family."]] as const;
function Spirit() {
  const [v, setV] = useState<number | null>(null);
  return (<div className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
    {VALUES.map(([n], i) => <button key={n} onClick={() => setV(i)} aria-pressed={v === i} style={{ ...sec, textAlign: "left", background: v === i ? "#4C397B" : "#fff", color: v === i ? "#fff" : "#4C397B" }}>{n}</button>)}
    {v !== null && <div className="ctr" style={{ fontWeight: 600 }}>{VALUES[v][1]}</div>}
  </div>);
}

export default function BoothActivity({ slug }: { slug: string }) {
  switch (slug) { case "bhasha": return <Bhasha />; case "bhusha": return <Bhusha />; case "bhojan": return <Bhojan />; case "arts": return <Arts />; case "festivals": return <Festivals />; case "spirituality": return <Spirit />; default: return null; }
}
