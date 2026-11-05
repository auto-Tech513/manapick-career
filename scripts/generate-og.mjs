// 記事ごとの固有OG画像（1200x675 PNG、16:9）をローカル生成する。
// Google Discoverの大きな画像表示に合わせ、タイトル文字主体ではなく
// ビジュアル主体の構成にする。記事にグラフ（article-charts）がある場合は
// その実データを描き、ない場合はデータモチーフを大きく描く。
// 第三者画像は使用しない。
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
const careersSource = fs.readFileSync(path.join(root, "content/jobs.ts"), "utf8");
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

function parseArticleCharts() {
  try {
    const source = fs.readFileSync(path.join(root, "content/article-charts.ts"), "utf8");
    const start = source.indexOf("= {", source.indexOf("articleCharts")) + 2;
    if (start < 2) return new Map();
    let depth = 0;
    let end = -1;
    for (let index = start; index < source.length; index += 1) {
      if (source[index] === "{") depth += 1;
      else if (source[index] === "}") {
        depth -= 1;
        if (depth === 0) { end = index; break; }
      }
    }
    if (end < 0) return new Map();
    return new Map(Object.entries(JSON.parse(source.slice(start, end + 1))));
  } catch {
    return new Map();
  }
}
const articleCharts = parseArticleCharts();

const graphemeCount = (value) => [...String(value)].length;

function chartVisual(chart, dy = 0, rowPitch = 52, maxBars = 5) {
  const bars = (chart?.bars ?? []).filter((bar) => Number.isFinite(bar.value) && bar.value > 0).slice(0, maxBars);
  if (bars.length < 2) return "";
  const max = Math.max(...bars.map((bar) => bar.value));
  if (!(max > 0)) return "";
  const barTop = 330 + dy;
  const rows = bars.map((bar, index) => {
    const y = barTop + index * rowPitch;
    const width = Math.max(36, Math.round((bar.value / max) * 560));
    const isMax = bar.value === max;
    const labelSize = graphemeCount(bar.label) > 12 ? 21 : 25;
    return `<rect x="388" y="${y}" width="640" height="30" rx="8" fill="#ffffff" opacity="0.13"/>
  <rect x="388" y="${y}" width="${width}" height="30" rx="8" fill="${isMax ? "#ffd700" : "#8fb0ea"}"/>
  ${textElement(bar.label, { x: 72, y: y + 3, size: labelSize, color: "#e8edf8" })}
  ${textElement(bar.display, { x: 400 + width, y: y + 1, size: 27, weight: fontFiles.bold.weight, color: isMax ? "#ffd700" : "#ffffff" })}`;
  }).join("\n  ");
  return `${textElement(chart.title, { x: 72, y: 288 + dy, size: 27, color: "#d8dfef" })}
  ${rows}`;
}

function motifVisual() {
  const bars = [
    { x: 806, height: 168, fill: "#8fb0ea", opacity: 0.55 },
    { x: 890, height: 286, fill: "#ffd700", opacity: 0.85 },
    { x: 974, height: 224, fill: "#8fb0ea", opacity: 0.7 },
    { x: 1058, height: 372, fill: "#ffd700", opacity: 0.95 },
  ];
  const rects = bars.map((bar) => `<rect x="${bar.x}" y="${675 - bar.height}" width="56" height="${bar.height}" rx="10" fill="${bar.fill}" opacity="${bar.opacity}"/>`).join("\n  ");
  return `${rects}
  <path d="M786 500 L898 372 L972 436 L1104 252" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  <path d="M1052 252 H1104 V304" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
}

function renderSvg({ title, label, date, type, chart }) {
  const badgeWidth = type === "NEWS" ? 124 : type === "GUIDE" ? 142 : type === "OCCUPATION" ? 248 : 168;
  const hasChart = Boolean(chartVisual(chart));
  let chartDy = 0;
  let chartPitch = 52;
  let chartMaxBars = 5;
  let layout;
  if (hasChart) {
    // 禁則の都合で特定のサイズ階梯だけ配置できないタイトルがあるため、
    // 階梯を変えた候補を順に試す。3行になる場合はグラフ側を詰める。
    const attempts = [
      { options: { maxLines: 2, maxWidth: 1056, fontSizes: [46, 42, 38, 34, 30] }, dy: 0, pitch: 52, maxBars: 5 },
      { options: { maxLines: 2, maxWidth: 1056 }, dy: 0, pitch: 52, maxBars: 5 },
      { options: { maxLines: 3, maxWidth: 1056, fontSizes: [40, 36, 32, 30] }, dy: 30, pitch: 46, maxBars: 5 },
      { options: { maxLines: 3, maxWidth: 1056 }, dy: 84, pitch: 40, maxBars: 4 },
    ];
    for (const attempt of attempts) {
      try {
        layout = layoutOgTitle(title, attempt.options);
        chartDy = attempt.dy;
        chartPitch = attempt.pitch;
        chartMaxBars = attempt.maxBars;
        break;
      } catch { /* 次の候補へ */ }
    }
    if (!layout) throw new Error(`OGタイトルを配置できません: ${title}`);
  } else {
    try {
      layout = layoutOgTitle(title, { maxLines: 3, maxWidth: 660, fontSizes: [44, 40, 36, 32] });
    } catch {
      layout = layoutOgTitle(title, { maxLines: 3, maxWidth: 660 });
    }
  }
  const titleHeight = layout.fontSize + (layout.lines.length - 1) * layout.lineHeight;
  const firstLineTop = hasChart ? 132 : Math.round(330 - titleHeight / 2);
  const titleLines = layout.lines.map((line, index) => textElement(line, {
    x: 72,
    y: firstLineTop + index * layout.lineHeight,
    size: layout.fontSize,
    weight: fontFiles.bold.weight,
  })).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101d3d"/><stop offset="1" stop-color="#182b58"/></linearGradient>
    <radialGradient id="glow" cx="1" cy="0"><stop offset="0" stop-color="#ffd700" stop-opacity=".42"/><stop offset="1" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#background)"/>
  <rect width="1200" height="675" fill="url(#glow)"/>
  <rect x="0" y="0" width="14" height="675" fill="#ffd700"/>
  ${hasChart ? chartVisual(chart, chartDy, chartPitch, chartMaxBars) : motifVisual()}
  <rect x="72" y="48" rx="22" width="${badgeWidth}" height="54" fill="#ffd700"/>
  ${textElement(type, { x: 94, y: 57, size: 28, weight: fontFiles.bold.weight, color: "#101d3d" })}
  ${textElement(label, { x: 72 + badgeWidth + 26, y: 57, size: 28, color: "#d8dfef" })}
  ${titleLines}
  <text x="72" y="584" dominant-baseline="hanging" font-family="${fontFamily}" font-size="30" font-weight="700"><tspan fill="#ffffff">manapick</tspan><tspan fill="#ffd700"> career</tspan></text>
  ${textElement(date ? `career.manapick.app　・　${date}` : "career.manapick.app", { x: 72, y: 626, size: 21, color: "#bac5dc" })}
  </svg>`;
}

async function render(item, type, directory, outputPath) {
  const output = outputPath ?? path.join(outputRoot, directory, `${item.slug}.png`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const renderer = new Resvg(renderSvg({ title: item.title, label: item.label, date: item.date, type, chart: articleCharts.get(item.slug) }), {
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
const checkedAtMatch = careersSource.match(/const checkedAt\s*=\s*"([^"]+)"/);
if (!checkedAtMatch) throw new Error("職業OG用の確認日を取得できません");
const categoryLabels = {
  "it-ai": "IT・AI",
  data: "データ",
  marketing: "マーケティング",
  creative: "クリエイティブ",
  "office-accounting": "事務・会計",
  "people-license": "対人・資格",
};
const careers = [...careersSource.matchAll(/slug:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*status:\s*"published"/g)]
  .map((match) => ({
    slug: match[1],
    title: `${match[2]}の仕事内容と、学びの入口`,
    label: categoryLabels[match[3]] ?? match[3],
    date: checkedAtMatch[1],
  }));
careers.push(...JSON.parse(fs.readFileSync(new URL('../content/professional-careers.json',import.meta.url),'utf8')).items.map(item=>({slug:item.slug,title:`${item.name}の仕事内容・資格・年収`,label:item.categoryLabel,date:item.researchedAt})));
const guideIndexOg = {
  slug: "index",
  title: "迷いを、確認できる手順に変える",
  label: "職業選びと学び方",
  date: guides.reduce((latest, item) => item.date > latest ? item.date : latest, "") || "公開前確認中",
};
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
const newsIndexOg = {
  slug: "index",
  title: "働く人のための、キャリアニュース",
  label: "一次資料を独自解説",
  date: newsWithPublication.reduce((latest, item) => item.date > latest ? item.date : latest, "") || "公開前確認中",
};
const publicNewsDirectory = path.join(outputRoot, "news");
if (!includeDraftPreviews && fs.existsSync(publicNewsDirectory)) {
  const expected = new Set([...newsWithPublication.map((item) => `${item.slug}.png`), `${newsIndexOg.slug}.png`]);
  for (const entry of fs.readdirSync(publicNewsDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicNewsDirectory, entry));
  }
}
const publicGuideDirectory = path.join(outputRoot, "guide");
if (!includeDraftPreviews && fs.existsSync(publicGuideDirectory)) {
  const expected = new Set([...guides.map((item) => `${item.slug}.png`), `${guideIndexOg.slug}.png`]);
  for (const entry of fs.readdirSync(publicGuideDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicGuideDirectory, entry));
  }
}
const shopSource = fs.readFileSync(path.join(root, "content/shop-products.ts"), "utf8");
const shopCheckedAt = shopSource.match(/checkedAt:\s*"([^"]+)"/)?.[1] ?? checkedAtMatch[1];
const staticPages = [
  ...Object.entries(categoryLabels).map(([key, label]) => ({
    slug: `category-${key}`,
    title: `${label}の仕事`,
    label: "カテゴリ別一覧",
    date: checkedAtMatch[1],
    type: "CATEGORY",
  })),
  {
    slug: "shop",
    title: "manapi商店｜学び直し・面接・仕事準備の道具",
    label: "学びと仕事の道具",
    date: shopCheckedAt,
    type: "SHOP",
  },
];
const publicPageDirectory = path.join(outputRoot, "page");
if (!includeDraftPreviews && fs.existsSync(publicPageDirectory)) {
  const expected = new Set(staticPages.map((item) => `${item.slug}.png`));
  for (const entry of fs.readdirSync(publicPageDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicPageDirectory, entry));
  }
}
const publicCareerDirectory = path.join(outputRoot, "career");
if (!includeDraftPreviews && fs.existsSync(publicCareerDirectory)) {
  const expected = new Set(careers.map((item) => `${item.slug}.png`));
  for (const entry of fs.readdirSync(publicCareerDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicCareerDirectory, entry));
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
const occupationPublication = JSON.parse(fs.readFileSync(path.join(root, "content/occupation-publication.json"), "utf8"));
const jobCatalog = JSON.parse(fs.readFileSync(path.join(root, "content/job-catalog.json"), "utf8"));
const catalogById = new Map(jobCatalog.occupations.map((item) => [item.catalogId, item]));
const catalogCategoryLabels = new Map(jobCatalog.categories.map((item) => [item.key, item.label]));
const publishedOccupations = (occupationPublication.records ?? [])
  .filter((record) => record.status === "published" && catalogById.has(record.catalogId))
  .map((record) => {
    const occupation = catalogById.get(record.catalogId);
    return {
      slug: record.catalogId,
      title: `${occupation.name}の仕事内容・年収・なり方`,
      label: catalogCategoryLabels.get(occupation.categoryKey) ?? "職業",
      date: record.publishedAt ?? record.checkedAt ?? "",
    };
  });
const publicOccupationDirectory = path.join(outputRoot, "occupation");
if (!includeDraftPreviews && fs.existsSync(publicOccupationDirectory)) {
  const expected = new Set(publishedOccupations.map((item) => `${item.slug}.png`));
  for (const entry of fs.readdirSync(publicOccupationDirectory)) {
    if (entry.endsWith(".png") && !expected.has(entry)) fs.rmSync(path.join(publicOccupationDirectory, entry));
  }
}
for (const occupation of publishedOccupations) await render(occupation, "OCCUPATION", "occupation");
for (const guide of guides) await render(guide, "GUIDE", "guide");
await render(guideIndexOg, "GUIDE", "guide");
for (const item of newsWithPublication) await render(item, "NEWS", "news");
await render(newsIndexOg, "NEWS", "news");
for (const career of careers) await render(career, "CAREER", "career");
for (const page of staticPages) await render(page, page.type, "page");
if (usesPublicOutput) {
  await render(
    { slug: "site-default", title: "なりたい仕事まで、迷わせない。", label: "職業情報サイト", date: "" },
    "CAREER",
    "page",
    path.join(root, "public/og.png"),
  );
}
console.log(`OG generated with BIZ UDPGothic font files: newsArticles=${newsWithPublication.length} newsIndex=1 guides=${guides.length} guideIndex=1 careers=${careers.length}`);
