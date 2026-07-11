export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://career.manapick.app").replace(/\/$/, "");
export const SITE_NAME = "manapick career";
export const TAGLINE = "なりたい仕事まで、迷わせない。";
export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).toString();

export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
