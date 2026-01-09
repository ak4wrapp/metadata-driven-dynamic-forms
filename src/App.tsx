import LandingPage from "./LandingPage";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function App() {
  return <LandingPage />;
}
