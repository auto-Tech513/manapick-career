import NetworkHeader from "./NetworkHeader";
import { occupationDirectory } from "../content/catalog";

export function SiteHeader() {
  return <NetworkHeader occupationCount={occupationDirectory.length} />;
}
