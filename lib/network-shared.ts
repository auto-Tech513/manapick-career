import { applyAmazonTag } from "./amazon-link.mjs";
import affiliate from "../content/affiliate-settings.json";
const hosts = new Set(["manapick.app", "ai.manapick.app", "license.manapick.app", "career.manapick.app", "company.manapick.app"]);
/**
 * Network rule (2026-11-01): sister-site links carry no UTM parameters.
 * Referrals between the five manapick sites are read from each site's GA4
 * referrer data instead. Third-party URLs are never altered here.
 * The source/content arguments are kept for call-site compatibility.
 */
export function networkUrl(href: string, source: string, content: string) {
  void source;
  void content;
  const url = new URL(href);
  if (!hosts.has(url.hostname)) return href;
  return url.toString();
}
/** Tracking IDs live only in affiliate-settings.json; preserve the configured value until supplied by the owner. */
export function amazonUrl(href: string): string {
  return applyAmazonTag(href, affiliate.amazonTag);
}
