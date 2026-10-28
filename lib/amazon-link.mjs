/** Apply the configured tag only to Amazon Japan commerce links. */
export function applyAmazonTag(href, tag) {
  if (!/^https?:\/\//.test(href)) return href;
  const url = new URL(href);
  if (url.hostname !== "www.amazon.co.jp" && url.hostname !== "amazon.co.jp") return href;
  url.searchParams.set("tag", tag);
  return url.toString();
}
