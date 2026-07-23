// 記事ごとの固有OG画像（1200x630 PNG）をローカル生成する。
// タイトルと記事種別だけを描画し、第三者画像は使用しない。
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { layoutOgTitle } from "./lib/og-title-layout.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = process.env.OG_OUTPUT_DIR
  ? path.resolve(process.env.OG_OUTPUT_DIR)
  : path.join(root, "public/og/biz-udp-v1");
const usesPublicOutput = !process.env.OG_OUTPUT_DIR;
const includeDraftPreviews = process.env.OG_INCLUDE_DRAFTS === "1";
if (includeDraftPreviews && !process.env.OG_OUTPUT_DIR) {
  throw new Error("draft OG previews require OG_OUTPUT_DIR; public/og must contain published items only");
}
// Public OG generation is allowed only after the same fail-closed editorial
// gate used by the site has validated review evidence, content hashes, primary
// sources, freshness and sister-site link QA. The pre-generation mode skips
// only the file-existence assertions for images that this process creates.
if (usesPublicOutput && !includeDraftPreviews) {
  execFileSync(process.execPath, [path.join(root, "scripts/check-editorial.mjs"), "--before-og"], {
    cwd: root,
    stdio: "inherit",
  });
}
const editorial = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const expanded = JSON.parse(fs.readFileSync(path.join(root, "content/news-expanded.json"), "utf8"));
const expandedGuides = JSON.parse(fs.readFileSync(path.join(root, "content/guides-expanded.json"), "utf8"));
const newsPublication = JSON.parse(fs.readFileSync(path.join(root, "content/news-publication.json"), "utf8"));
const require = createRequire(import.meta.url);
const fontRoot = path.dirname(require.resolve("@expo-google-fonts/biz-udpgothic/package.json"));
const fontFamily = "BIZ UDPGothic";
const fontFiles = {
  regular: { file: path.join(fontRoot, "400Regular/BIZUDPGothic_400Regular.ttf"), weight: 400 },
  bold: { file: path.join(fontRoot, "700Bold/BIZUDPGothic_700Bold.ttf"), weight: 700 },
};

for (const fontFace of Object.values(fontFiles)) {
  if (!fs.existsSync(fontFace.file)) throw new Error(`OG用日本語フォントが見つかりません: ${fontFace.file}`);
}

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
function pickObjects(blockName) {
  const start = editorial.indexOf(blockName);
  const end = editorial.indexOf("\n];", start);
  if (start < 0 || end < 0) throw new Error(`${blockName} not found`);
  const block = editorial.slice(start, end);
  return [...block.matchAll(/slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?(?:category|kind):\s*"([^"]+)"[\s\S]*?publishedAt:\s*"([^"]+)"/g)]
    .map((match) => ({ slug: match[1], title: match[2], label: match[3], date: match[4] }));
}

function textElement(text, { x, y, size, weight = 400, color = "#ffffff" }) {
  return `<text x="${x}" y="${y}" dominant-baseline="hanging" fill="${color}" font-family="${fontFamily}" font-size="${size}" font-weight="${weight}">${esc(text)}</text>`;
}

function renderSvg({ title, label, date, type }) {
  const layout = layoutOgTitle(title);
  const titleHeight = layout.fontSize + (layout.lines.length - 1) * layout.lineHeight;
  const firstLineTop = Math.round(280 - titleHeight / 2);
  const titleLines = layout.lines.map((line, index) => textElement(line, {
    x: 72,
    y: firstLineTop + index * layout.lineHeight,
    size: layout.fontSize,
    weight: fontFiles.bold.weight,
  })).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101d3d"/><stop offset="1" stop-color="#182b58"/></linearGradient>
    <radialGradient id="glow" cx="1" cy="0"><stop offset="0" stop-color="#ffd700" stop-opacity=".42"/><stop offset="1" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="14" height="630" fill="#ffd700"/>
  <rect x="72" y="58" rx="22" width="${type === "NEWS" ? 124 : 142}" height="54" fill="#ffd700"/>
  <path d="M1040 452 L1110 382 L1110 424 L1160 374" fill="none" stroke="#ffd700" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1115 374 H1160 V419" fill="none" stroke="#ffd700" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  ${textElement(type, { x: 94, y: 67, size: 28, weight: fontFiles.bold.weight, color: "#101d3d" })}
  ${textElement(label, { x: type === "NEWS" ? 222 : 240, y: 67, size: 28, color: "#d8dfef" })}
  ${titleLines}
  <text x="72" y="520" dominant-baseline="hanging" font-family="${fontFamily}" font-size="34" font-weight="700"><tspan fill="#ffffff">manapick</tspan><tspan fill="#ffd700"> career</tspan></text>
  ${textElement(`career.manapick.app　・　${date}`, { x: 72, y: 566, size: 23, color: "#bac5dc" })}
  </svg>`;
}

async function render(item, type, directory) {
  const output = path.join(outputRoot, directory, `${item.slug}.png`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const renderer = new Resvg(renderSvg({ title: item.title, label: item.label, date: item.date, type }), {
    font: {
      fontFiles: Object.values(fontFiles).map((fontFace) => fontFace.file),
      loadSystemFonts: false,
      defaultFontFamily: fontFamily,
    },
  });
  fs.writeFileSync(output, renderer.render().asPng());
}

const guides = [
  ...pickObjects("const baseGuides"),
  ...expandedGuides
    .filter((item) => includeDraftPreviews || (
      item.status === "published"
      && item.publishedAt
      && item.reviewedAt
      && item.reviewedBy
      && item.reviewedByHumanAt
    ))
    .map((item) => ({ slug: item.slug, title: item.title, label: item.category, date: item.publishedAt ?? item.createdAt })),
];
const baseNews = pickObjects("const newsItemsData");
const newsPublicationBySlug = new Map(newsPublication.records.map((item) => [item.slug, item]));
const publishableNews = (item) => {
  const publication = newsPublicationBySlug.get(item.slug);
  return Boolean(publication
    && (includeDraftPreviews || publication.status === "published")
    && (includeDraftPreviews || (
      publication.publishedAt
      && publication.reviewedAt
      && publication.reviewedBy
      && publication.reviewedByHumanAt
      && publication.reviewEvidence
    )));
};
const newsWithPublication = [...baseNews, ...expanded]
  .filter(publishableNews)
  .map((item) => {
    const publication = newsPublicationBySlug.get(item.slug);
    return {
      slug: item.slug,
      title: item.title,
      label: item.label ?? item.kind,
      date: publication.publishedAt ?? publication.createdAt,
    };
  });
const publicNewsDirectory = path.join(outputRoot, "news");
if (!includeDraftPreviews && fs.existsSync(publicNewsDirectory)) {
  const expected = new Set(newsWithPublication.map((item) => `${item.slug}.png`));
  for (const entry of fs.readdirSync(publicNewsDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicNewsDirectory, entry));
  }
}
// The previous generators wrote article images to versionless and Noto-based
// public paths. They are not referenced anymore, and retaining them would keep
// draft news images and the old Japanese glyph rendering publicly accessible.
// Preview builds use OG_OUTPUT_DIR and must never mutate the public tree.
if (usesPublicOutput && !includeDraftPreviews) {
  for (const legacyDirectory of [path.join(root, "public/og/guide"), path.join(root, "public/og/news"), path.join(root, "public/og/jp-v2")]) {
    if (fs.existsSync(legacyDirectory)) fs.rmSync(legacyDirectory, { recursive: true, force: true });
  }
}
for (const guide of guides) await render(guide, "GUIDE", "guide");
for (const item of newsWithPublication) await render(item, "NEWS", "news");
console.log(`OG generated with BIZ UDPGothic font files: news=${newsWithPublication.length} guides=${guides.length}`);
