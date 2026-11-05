import TabBar from "@/components/TabBar";
export default function Page() {
  return (
    <main className="screen">
      <h1>Updates</h1>
      <p>Announcements from the organizers will appear here.</p>
      <TabBar active="/updates" />
    </main>
  );
}
