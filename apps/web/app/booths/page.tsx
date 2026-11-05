import TabBar from "@/components/TabBar";
export default function Page() {
  return (
    <main className="screen">
      <h1>Booths</h1>
      <p>Six virtual booths are coming soon.</p>
      <TabBar active="/booths" />
    </main>
  );
}
