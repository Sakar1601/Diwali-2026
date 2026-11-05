import TabBar from "@/components/TabBar";
export default function Page() {
  return (
    <main className="screen">
      <h1>Moments</h1>
      <p>Photo frames are coming soon.</p>
      <TabBar active="/moments" />
    </main>
  );
}
