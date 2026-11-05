import Link from "next/link";
import TabBar from "@/components/TabBar";

// Wording is a draft for Swami review before the event.
const CARDS = [
  ["What is Annakut?", "Annakut means a mountain of food. Devotees prepare many dishes and arrange them before the deity as a loving offering of thanks."],
  ["Why is it celebrated?", "It remembers Govardhan Puja. In the story, Bhagwan Krishna lifted the Govardhan hill to protect the villagers, and they offered gratitude for His care."],
  ["What you will see", "Rows of sweets, savories and grains placed before the murtis in the mandir, arranged with care by volunteers and devotees."],
  ["What is prasad?", "After the offering, the food is blessed and shared with everyone as prasad. It is received with respect and gratitude."],
  ["How can I take part?", "Join the darshan and aarti, visit the booths, and take prasad. Ask any volunteer if you would like help finding your way."],
];
export default function Annakut() {
  return (
    <main className="screen">
      <Link className="back" href="/today">‹ Today</Link>
      <h1>What is Annakut?</h1>
      <p>A 2-minute guide to today.</p>
      {CARDS.map(([t, d], i) => (<section className="card" key={t}><span className="step">{i + 1} of {CARDS.length}</span><h2>{t}</h2><p style={{ color: "var(--tx)" }}>{d}</p></section>))}
      <TabBar active="/today" />
    </main>
  );
}
