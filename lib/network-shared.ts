import { applyAmazonTag } from "./amazon-link.mjs";
import affiliate from "../content/affiliate-settings.json";
const hosts = new Set(["manapick.app", "ai.manapick.app", "license.manapick.app", "career.manapick.app", "company.manapick.app"]);
/** Same attribution vocabulary across the network; do not alter third-party URLs. */
export function networkUrl(href: string, source: string, content: string) {
  const url = new URL(href);
  if (!hosts.has(url.hostname)) return href;
  url.searchParams.set("utm_source", source === "manapick" ? "manapick" : `manapick_${source}`);
  url.searchParams.set("utm_medium", "network");
  url.searchParams.set("utm_campaign", "learn_to_career");
  url.searchParams.set("utm_content", content);
  return url.toString();
}
/** Tracking IDs live only in affiliate-settings.json; preserve the configured value until supplied by the owner. */
export function amazonUrl(href: string): string {
  return applyAmazonTag(href, affiliate.amazonTag);
}
