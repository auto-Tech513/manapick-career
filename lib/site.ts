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

export const articleOgUrl = (kind: "news" | "guide" | "career", slug: string, revision = "") => {
  const url = new URL(`${ARTICLE_OG_BASE}/${kind}/${slug}.png`, `${SITE_URL}/`);
  url.searchParams.set("v", stableRevision(`${ARTICLE_OG_REVISION}|${revision}`));
  return url.toString();
};

export const pageOgUrl = (slug: string, revision = "") => {
  const url = new URL(`${ARTICLE_OG_BASE}/page/${slug}.png`, `${SITE_URL}/`);
  url.searchParams.set("v", stableRevision(`${ARTICLE_OG_REVISION}|page|${revision}`));
  return url.toString();
};

// 検索結果で途切れにくい長さへ、文の区切りを保って短縮する。本文・構造化データには使わない。
export function metaDescription(text: string, max = 120) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const sentences = normalized.match(/[^。]+。/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break;
    out += sentence;
  }
  if (out) return out;
  const head = normalized.slice(0, max);
  const comma = head.lastIndexOf("、");
  if (comma >= Math.floor(max * 0.6)) return `${head.slice(0, comma)}。`;
  return `${head.slice(0, max - 1)}…`;
}

export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
