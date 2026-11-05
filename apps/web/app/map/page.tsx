import TabBar from "@/components/TabBar";
export default function Page() {
  return (
    <main className="screen">
      <h1>Map</h1>
      <p>Directions between stations arrive once the floor plan is ready.</p>
      <TabBar active="/map" />
    </main>
  );
}
