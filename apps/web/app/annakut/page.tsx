import { PageBar } from "@/components/ui";

// Wording is a draft for Swami review before the event.
const CARDS = [
  ["What is Annakut?", 'Annakut means "mountain of food". Devotees prepare many kinds of vegetarian dishes and offer them to God with love and gratitude. You will see them arranged in a grand display before the deity.'],
  ["Why do we celebrate it?", "It remembers Bhagwan Shri Krishna lifting Govardhan Hill on his little finger to protect the people of Vraj from heavy rain. The people trusted God, and Annakut is our way of saying thank you."],
  ["When is it celebrated?", "Traditionally on the day after Diwali, the first day of the new year in the Gujarati calendar. Here we celebrate it on Saturday, Nov 14."],
  ["What happens to the food?", "After the offering, the food becomes prasad. It is shared with everyone as a blessing."],
  ["How to take part", "Take darshan, walk slowly and keep your voice low. Remove your shoes before the hall. Ask a volunteer if you are unsure."],
];
export default function Annakut() {
  return (
    <main className="screen narrow">
      <div className="pg" style={{ gap: 12 }}>
        <PageBar back="/today" tag="About Annakut" />
        <div><h1 className="ttl">Annakut: a mountain of food</h1><p className="lead">A short guide. Takes about 2 minutes.</p></div>
        {CARDS.map(([t, d], i) => (
          <div className="card" key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span className="ic" style={{ background: "#4353A2", width: 36, height: 36, fontWeight: 800, fontSize: 16 }}>{i + 1}</span>
            <div><b style={{ fontSize: 17 }}>{t}</b><div className="mu" style={{ fontSize: 15, lineHeight: 1.45, marginTop: 4 }}>{d}</div></div>
          </div>
        ))}
      </div>
    </main>
  );
}
