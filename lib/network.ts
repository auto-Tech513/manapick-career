import map from "@/content/network-map.json";

export function networkUrl(itemId: string) {
  const item = map.items[itemId as keyof typeof map.items];
  if (!item) throw new Error(`Unknown network item: ${itemId}`);
  const site = map.sites[item.siteId as keyof typeof map.sites];
  return new URL(item.path, `${site.baseUrl}/`).toString();
}
