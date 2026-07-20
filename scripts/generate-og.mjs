// 記事ごとの固有OG画像（1200x630 PNG）をローカル生成する。
// タイトルと記事種別だけを描画し、第三者画像は使用しない。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editorial = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const expanded = JSON.parse(fs.readFileSync(path.join(root, "content/news-expanded.json"), "utf8"));
const font = "Hiragino Sans, 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', sans-serif";

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
const width = (char) => (char.codePointAt(0) > 0x2e80 ? 1 : 0.55);
function wrap(text, limit = 16, maxLines = 3) {
  const lines = [];
  let line = "";
  let current = 0;
  for (const char of String(text)) {
    const next = width(char);
    if (current + next > limit) {
      lines.push(line);
      line = "";
      current = 0;
      if (lines.length === maxLines) break;
    }
    line += char;
    current += next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.join("").length < [...String(text)].length) lines[maxLines - 1] = `${lines[maxLines - 1].replace(/.$/, "")}…`;
  return lines;
}

function pickObjects(blockName) {
  const start = editorial.indexOf(blockName);
  const end = editorial.indexOf("\n];", start);
  if (start < 0 || end < 0) throw new Error(`${blockName} not found`);
  const block = editorial.slice(start, end);
  return [...block.matchAll(/slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?(?:category|kind):\s*"([^"]+)"[\s\S]*?publishedAt:\s*"([^"]+)"/g)]
    .map((match) => ({ slug: match[1], title: match[2], label: match[3], date: match[4] }));
}

function svg({ title, label, date, type }) {
  const lines = wrap(title);
  const startY = lines.length === 1 ? 314 : lines.length === 2 ? 265 : 220;
  const titleSvg = lines.map((line, index) => `<text x="72" y="${startY + index * 82}" font-size="58" font-weight="800" fill="#ffffff" font-family="${font}">${esc(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101d3d"/><stop offset="1" stop-color="#182b58"/></linearGradient>
    <radialGradient id="glow" cx="1" cy="0"><stop offset="0" stop-color="#ffd700" stop-opacity=".42"/><stop offset="1" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="14" height="630" fill="#ffd700"/>
  <rect x="72" y="58" rx="22" width="${type === "NEWS" ? 124 : 142}" height="54" fill="#ffd700"/>
  <text x="94" y="95" font-size="28" font-weight="800" fill="#101d3d" font-family="${font}">${type}</text>
  <text x="${type === "NEWS" ? 222 : 240}" y="95" font-size="28" font-weight="650" fill="#d8dfef" font-family="${font}">${esc(label)}</text>
  ${titleSvg}
  <text x="72" y="554" font-size="34" font-weight="800" fill="#ffffff" font-family="${font}">manapick <tspan fill="#ffd700">career</tspan></text>
  <text x="72" y="594" font-size="23" fill="#bac5dc" font-family="${font}">career.manapick.app　・　${esc(date)}</text>
  <path d="M1040 452 L1110 382 L1110 424 L1160 374" fill="none" stroke="#ffd700" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1115 374 H1160 V419" fill="none" stroke="#ffd700" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

async function render(item, type, directory) {
  const output = path.join(root, "public/og", directory, `${item.slug}.png`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(Buffer.from(svg({ title: item.title, label: item.label, date: item.date, type }))).png({ compressionLevel: 9 }).toFile(output);
}

const guides = pickObjects("export const guides");
const baseNews = pickObjects("const newsItemsData");
const expandedNews = expanded.map((item) => ({ slug: item.slug, title: item.title, label: item.kind, date: "2026-07-14" }));
for (const guide of guides) await render(guide, "GUIDE", "guide");
for (const item of [...baseNews, ...expandedNews]) await render(item, "NEWS", "news");
console.log(`OG generated: news=${baseNews.length + expandedNews.length} guides=${guides.length}`);
