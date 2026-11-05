"use client";
import { useRef, useState } from "react";
import { track } from "@/lib/device";

const FRAMES = [
  { n: "Diya glow", c: "#F4B31A" }, { n: "Marigold", c: "#E8731A" }, { n: "Rangoli", c: "#71318E" }, { n: "Toran", c: "#17795C" },
  { n: "Lamps", c: "#4353A2" }, { n: "Stars", c: "#C0306E" }, { n: "Lotus", c: "#E86A92" },
];
const W = 1080, H = 1350;

export default function Moments() {
  const cv = useRef<HTMLCanvasElement>(null); const img = useRef<HTMLImageElement | null>(null);
  const [fi, setFi] = useState(0); const [has, setHas] = useState(false);
  function draw(i = fi) {
    const c = cv.current!, g = c.getContext("2d")!; const col = FRAMES[i].c;
    g.fillStyle = "#fff"; g.fillRect(0, 0, W, H);
    if (img.current) {
      const im = img.current, s = Math.max(W / im.width, H / im.height), w = im.width * s, h = im.height * s;
      g.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    }
    g.strokeStyle = col; g.lineWidth = 56; g.strokeRect(28, 28, W - 56, H - 56);
    g.fillStyle = col; for (const [x, y] of [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]]) { g.beginPath(); g.arc(x, y, 46, 0, 7); g.fill(); }
    for (let x = 160; x < W - 120; x += 90) { g.beginPath(); g.arc(x, 60, 14, 0, 7); g.fill(); }
    g.fillRect(0, H - 150, W, 150); g.fillStyle = "#fff"; g.font = "600 44px system-ui"; g.textAlign = "center";
    g.fillText("Light Beyond Lamps · Diwali 2026", W / 2, H - 70);
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const im = new Image(); im.onload = () => { img.current = im; setHas(true); draw(); URL.revokeObjectURL(im.src); }; im.src = URL.createObjectURL(f);
  }
  async function save() {
    cv.current!.toBlob(async (b) => {
      if (!b) return; const file = new File([b], "diwali-moment.png", { type: "image/png" });
      track("made_moment");
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch { /* cancelled */ } }
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "diwali-moment.png"; a.click();
    }, "image/png");
  }
  return (
    <>
      <div><div className="eb">Photo frames</div><h1 className="ttl" style={{ marginTop: 6 }}>Frame camera</h1><p className="lead">Take a selfie and add a Diwali frame. Your photo stays on your phone.</p></div>
      <div className="mom">
      <div className="momcv"><canvas ref={cv} width={W} height={H} style={{ width: "100%", height: "auto", display: "block", borderRadius: 16, border: "1px solid var(--line)", background: "linear-gradient(160deg,#4353A2,#71318E)" }} aria-label="Photo preview" />{!has && <div className="momhint"><b>Your photo appears here</b><span>Choose a frame, then tap Take or choose a photo.</span></div>}</div>
      <div className="momctl">
      <label className="btn btn-p" style={{ cursor: "pointer" }}>{has ? "Retake photo" : "Take or choose a photo"}<input type="file" accept="image/*" capture="user" onChange={onFile} style={{ display: "none" }} /></label>
      <div className="chips" role="group" aria-label="Frames">
        {FRAMES.map((f, i) => <button key={f.n} onClick={() => { setFi(i); draw(i); }} aria-pressed={fi === i} style={{ flex: "0 0 auto", minHeight: 44, padding: "0 18px", borderRadius: 999, border: `2px solid ${f.c}`, background: fi === i ? f.c : "#fff", color: fi === i ? "#fff" : "#040707", font: "inherit", fontWeight: 700, fontSize: 15 }}>{f.n}</button>)}
      </div>
      {has && <button className="btn btn-s" onClick={save}>Save or share</button>}
      </div></div>
    </>
  );
}
