import TabBar from "@/components/TabBar";
export default function Page() {
  return (
    <main className="screen">
      <h1>What is Annakut?</h1>
      <p>A short guide is coming soon.</p>
      <TabBar active="/annakut" />
    </main>
  );
}
