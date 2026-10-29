// 一覧カード専用サムネイル（800x420 PNG）をローカル生成する。
// OG画像と違い、タイトル文字・ロゴ・矢印は入れない。主題を表す大きなグリフと
// 抽象モチーフだけで構成し、カード上のチップや見出しと衝突しないようにする。
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "public/card");
const require = createRequire(import.meta.url);
const fontRoot = path.dirname(require.resolve("@expo-google-fonts/biz-udpgothic/package.json"));
const fontFamily = "BIZ UDPGothic";
const fontFiles = [
  { file: path.join(fontRoot, "400Regular/BIZUDPGothic_400Regular.ttf"), weight: 400 },
  { file: path.join(fontRoot, "700Bold/BIZUDPGothic_700Bold.ttf"), weight: 700 },
];
for (const fontFace of fontFiles) {
  if (!fs.existsSync(fontFace.file)) throw new Error(`カード画像用日本語フォントが見つかりません: ${fontFace.file}`);
}

const editorial = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const expandedGuides = JSON.parse(fs.readFileSync(path.join(root, "content/guides-expanded.json"), "utf8"));
const expandedNews = JSON.parse(fs.readFileSync(path.join(root, "content/news-expanded.json"), "utf8"));
const publication = JSON.parse(fs.readFileSync(path.join(root, "content/news-publication.json"), "utf8"));
const publishedNewsSlugs = new Set(
  (publication.records ?? []).filter((r) => r.status === "published").map((r) => r.slug),
);

function pickBase(blockStart, kind) {
  const start = editorial.indexOf(blockStart);
  if (start < 0) return [];
  const end = editorial.indexOf("\n];", start);
  const block = editorial.slice(start, end);
  return [...block.matchAll(/slug:\s*"([^"]+)"[\s\S]*?(?:category|kind):\s*"([^"]+)"/g)].map((m) => ({
    slug: m[1],
    label: m[2],
    kind,
  }));
}

const GUIDE_STYLE = [
  { test: (c) => c === "職業の違い", glyph: "違", accent: "#ffd700" },
  { test: (c) => ["AI活用", "AI検証"].includes(c), glyph: "AI", accent: "#c4b5fd" },
  { test: (c) => ["資格と応募", "資格の確認"].includes(c), glyph: "資", accent: "#fda4af" },
  { test: (c) => ["学び方", "学習ルート", "学習計画", "学習設計", "動画学習", "上達確認", "講座比較"].includes(c), glyph: "学", accent: "#fbbf24" },
  { test: (c) => ["職業を試す", "成果物づくり", "経験の棚卸し", "経験の伝え方"].includes(c), glyph: "試", accent: "#86efac" },
  { test: () => true, glyph: "確", accent: "#7dd3fc" },
];
const NEWS_GLYPH = {
  "雇用統計": ["統", "#7dd3fc"],
  "賃金・労働時間": ["賃", "#ffd700"],
  "賃金・制度": ["制", "#ffd700"],
  "雇用・制度": ["制", "#fbbf24"],
  "両立・制度": ["両", "#fda4af"],
  "AI・DX": ["AI", "#c4b5fd"],
  "デジタル人材": ["デ", "#c4b5fd"],
  "人材育成": ["育", "#86efac"],
  "働き方": ["働", "#86efac"],
  "働き方・白書": ["書", "#fbbf24"],
  "キャリア形成": ["進", "#7dd3fc"],
  "新卒採用": ["卒", "#fbbf24"],
  "教育・採用": ["教", "#fbbf24"],
  "医療・資格": ["医", "#fda4af"],
  "雇用・労働": ["労", "#7dd3fc"],
  "産業・白書": ["書", "#fbbf24"],
  "産業・統計": ["産", "#7dd3fc"],
  "家計・統計": ["家", "#7dd3fc"],
  "労働統計": ["労", "#ffd700"],
  "労働安全": ["安", "#fda4af"],
};

function styleFor(kind, label) {
  if (kind === "guide") {
    const found = GUIDE_STYLE.find((s) => s.test(label));
    return { glyph: found.glyph, accent: found.accent };
  }
  const found = NEWS_GLYPH[label];
  if (found) return { glyph: found[0], accent: found[1] };
  const firstKanji = [...label].find((ch) => /[一-龯]/.test(ch)) ?? "記";
  return { glyph: firstKanji, accent: "#ffd700" };
}

function hashOf(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function renderSvg({ glyph, accent }, seed) {
  const variant = seed % 3;
  const isLatin = glyph.length > 1;
  const glyphSize = isLatin ? 190 : 280;
  const glyphX = (isLatin ? 420 : 472) + [0, 14, -14][variant];
  const glyphY = isLatin ? 108 : 62;
  const circles = [
    { cx: 90 + variant * 30, cy: 330, r: 130 },
    { cx: 190 + variant * 20, cy: 370, r: 84 },
    { cx: 700 - variant * 40, cy: 60, r: 110 },
  ]
    .map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="2"/>`)
    .join("");
  const dots = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => `<circle cx="${64 + col * 26}" cy="${64 + row * 26}" r="4" fill="#ffffff" fill-opacity="0.20"/>`).join(""),
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101d3d"/><stop offset="1" stop-color="#1b3263"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15"><stop offset="0" stop-color="${accent}" stop-opacity=".38"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="800" height="420" fill="url(#background)"/>
  <rect width="800" height="420" fill="url(#glow)"/>
  ${circles}
  ${dots}
  <text x="${glyphX}" y="${glyphY}" dominant-baseline="hanging" fill="${accent}" fill-opacity="0.92" font-family="${fontFamily}" font-size="${glyphSize}" font-weight="700">${glyph}</text>
  <rect x="0" y="404" width="800" height="16" fill="${accent}"/>
</svg>`;
}

function render(item) {
  const style = styleFor(item.kind, item.label);
  const svg = renderSvg(style, hashOf(item.slug));
  const resvg = new Resvg(svg, {
    font: { fontFiles: fontFiles.map((f) => f.file), loadSystemFonts: false, defaultFontFamily: fontFamily },
  });
  const png = resvg.render().asPng();
  const dir = path.join(outputRoot, item.kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${item.slug}.png`), png);
}

fs.rmSync(outputRoot, { recursive: true, force: true });

const items = [];
// guides: base (editorial.ts) + expanded (all published by construction of `guides`)
for (const g of pickBase("const baseGuides", "guide")) items.push(g);
for (const g of expandedGuides) if (g.status === "published") items.push({ slug: g.slug, label: g.category, kind: "guide" });
// news: base + expanded, restricted to items whose publication record is published
for (const n of pickBase("const newsItemsData", "news")) if (publishedNewsSlugs.has(n.slug)) items.push(n);
for (const n of expandedNews) if (publishedNewsSlugs.has(n.slug)) items.push({ slug: n.slug, label: n.kind, kind: "news" });

const seen = new Set();
let count = 0;
for (const item of items) {
  const key = `${item.kind}/${item.slug}`;
  if (seen.has(key)) continue;
  seen.add(key);
  render(item);
  count += 1;
}
console.log(`card images generated: ${count}`);
