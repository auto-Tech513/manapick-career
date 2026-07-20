// 記事ごとの固有OG画像（1200x630 PNG）をローカル生成する。
// タイトルと記事種別だけを描画し、第三者画像は使用しない。
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { layoutOgTitle } from "./lib/og-title-layout.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
fs.mkdirSync("/tmp/manapick-og-fontconfig-cache", { recursive: true });
const outputRoot = process.env.OG_OUTPUT_DIR
  ? path.resolve(process.env.OG_OUTPUT_DIR)
  : path.join(root, "public/og/jp-v2");
const includeDraftPreviews = process.env.OG_INCLUDE_DRAFTS === "1";
process.env.FONTCONFIG_FILE = path.join(root, "scripts/fontconfig-og.xml");
const { default: sharp } = await import("sharp");
const editorial = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const expanded = JSON.parse(fs.readFileSync(path.join(root, "content/news-expanded.json"), "utf8"));
const expandedGuides = JSON.parse(fs.readFileSync(path.join(root, "content/guides-expanded.json"), "utf8"));
const require = createRequire(import.meta.url);
const fontRoot = path.dirname(require.resolve("@expo-google-fonts/noto-sans-jp/package.json"));
const fontFiles = {
  medium: { file: path.join(fontRoot, "500Medium/NotoSansJP_500Medium.ttf"), description: "Noto Sans JP Medium" },
  bold: { file: path.join(fontRoot, "700Bold/NotoSansJP_700Bold.ttf"), description: "Noto Sans JP Bold" },
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

function backgroundSvg(type) {
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
  </svg>`;
}

function textInput(text, { fontFace, size, color = "#ffffff" }) {
  return {
    text: {
      text: `<span foreground="${color}">${esc(text)}</span>`,
      font: `${fontFace.description} ${size}`,
      fontfile: fontFace.file,
      rgba: true,
      dpi: 72,
    },
  };
}

function overlays({ title, label, date, type }) {
  const layout = layoutOgTitle(title);
  const titleHeight = layout.fontSize + (layout.lines.length - 1) * layout.lineHeight;
  const firstLineTop = Math.round(280 - titleHeight / 2);
  return [
    { input: textInput(type, { fontFace: fontFiles.bold, size: 28, color: "#101d3d" }), left: 94, top: 67 },
    { input: textInput(label, { fontFace: fontFiles.medium, size: 28, color: "#d8dfef" }), left: type === "NEWS" ? 222 : 240, top: 67 },
    ...layout.lines.map((line, index) => ({
      input: textInput(line, { fontFace: fontFiles.bold, size: layout.fontSize }),
      left: 72,
      top: firstLineTop + index * layout.lineHeight,
    })),
    {
      input: {
        text: {
          text: '<span foreground="#ffffff">manapick</span> <span foreground="#ffd700">career</span>',
          font: `${fontFiles.bold.description} 34`,
          fontfile: fontFiles.bold.file,
          rgba: true,
          dpi: 72,
        },
      },
      left: 72,
      top: 520,
    },
    { input: textInput(`career.manapick.app　・　${date}`, { fontFace: fontFiles.medium, size: 23, color: "#bac5dc" }), left: 72, top: 566 },
  ];
}

async function render(item, type, directory) {
  const output = path.join(outputRoot, directory, `${item.slug}.png`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(Buffer.from(backgroundSvg(type)))
    .composite(overlays({ title: item.title, label: item.label, date: item.date, type }))
    .png({ compressionLevel: 9 })
    .toFile(output);
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
const expandedNews = expanded.map((item) => ({ slug: item.slug, title: item.title, label: item.kind, date: "2026-07-14" }));
for (const guide of guides) await render(guide, "GUIDE", "guide");
for (const item of [...baseNews, ...expandedNews]) await render(item, "NEWS", "news");
console.log(`OG generated with Noto Sans JP font files: news=${baseNews.length + expandedNews.length} guides=${guides.length}`);
