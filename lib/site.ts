export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://career.manapick.app").replace(/\/$/, "");
export const SITE_NAME = "manapick career";
export const TAGLINE = "なりたい仕事まで、迷わせない。";
export const ARTICLE_OG_BASE = "/og/biz-udp-v1";
export const ARTICLE_OG_REVISION = "biz-udp-resvg-v1";
export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).toString();

function stableRevision(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export const articleOgUrl = (kind: "news" | "guide", slug: string, revision = "") => {
  const url = new URL(`${ARTICLE_OG_BASE}/${kind}/${slug}.png`, `${SITE_URL}/`);
  url.searchParams.set("v", stableRevision(`${ARTICLE_OG_REVISION}|${revision}`));
  return url.toString();
};

export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
