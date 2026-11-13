export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://career.manapick.app").replace(/\/$/, "");
export const SITE_NAME = "manapick career";
export const TAGLINE = "なりたい仕事まで、迷わせない。";
export const ARTICLE_OG_BASE = "/og/biz-udp-v1";
export const ARTICLE_OG_REVISION = "biz-udp-resvg-v2";
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

export const occupationOgUrl = (catalogId: string, revision = "") => {
  const url = new URL(`${ARTICLE_OG_BASE}/occupation/${catalogId}.png`, `${SITE_URL}/`);
  url.searchParams.set("v", stableRevision(`${ARTICLE_OG_REVISION}|occupation|${revision}`));
  return url.toString();
};

export const pageOgUrl = (slug: string, revision = "") => {
  const url = new URL(`${ARTICLE_OG_BASE}/page/${slug}.png`, `${SITE_URL}/`);
  url.searchParams.set("v", stableRevision(`${ARTICLE_OG_REVISION}|page|${revision}`));
  return url.toString();
};

// 検索結果のスニペットとして十分な長さ（150〜160字目安）へ、文の区切りを保って整える。本文・構造化データには使わない。
export function metaDescription(text: string, max = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const sentences = normalized.match(/[^。]+。/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break;
    out += sentence;
  }
  // 文単位の切り取りでは短すぎる場合、続きを足してスニペットの長さを確保する。
  // 句読点で切って十分な長さになる場合だけ句読点切りを使い、短くなりすぎる場合は上限まで使う。
  if (out && out.length < max - 12 && out.length < normalized.length) {
    const rest = normalized.slice(out.length);
    const budget = max - out.length;
    const head = rest.slice(0, budget);
    const comma = head.lastIndexOf("、");
    if (comma >= Math.floor(budget * 0.6) && out.length + comma + 1 >= max - 12) return `${out}${head.slice(0, comma)}。`;
    return `${out}${head.slice(0, Math.max(0, budget - 1))}…`;
  }
  if (out) return out;
  const head = normalized.slice(0, max);
  const comma = head.lastIndexOf("、");
  if (comma >= Math.floor(max * 0.6) && comma + 1 >= max - 12) return `${head.slice(0, comma)}。`;
  return `${head.slice(0, max - 1)}…`;
}

export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
