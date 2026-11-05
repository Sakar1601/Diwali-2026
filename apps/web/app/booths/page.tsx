import TabBar from "@/components/TabBar";
import BoothsView from "@/components/BoothsView";
export default function Page() {
  return (<main className="screen"><h1>Virtual booths</h1><p>Visit each booth to light its lamp.</p><BoothsView /><TabBar active="/booths" /></main>);
}
