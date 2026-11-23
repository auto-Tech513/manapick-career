// 記事ごとの固有OG画像（1200x675 PNG、16:9）をローカル生成する（2026-11-17 career のデザイン言語へ刷新）。
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
import { newsTopicFor } from "./lib/news-topic-map.mjs";

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

// --- career のデザイン言語（2026-11-17 刷新） ---
// クリーム地・濃紺(#172033)の太い線・角丸の枠・黄色(#FFD700)のアクセント。
// トップの「しごとの街」と同じアイソメトリックの箱と木のイラスト調で描く。
// 紺一色の背景＋グラデーション＋白い矢印の旧デザインは使わない。
const OG = {
  paper: "#f5f2ea",
  card: "#fbfaf7",
  ink: "#172033",
  yellow: "#ffd700",
  yellowPale: "#fff6c7",
  side: "#ece7da",
  green: "#a9d8b8",
  muted: "#5b6476",
};

function chartVisual(chart, dy = 0, rowPitch = 52, maxBars = 5) {
  const bars = (chart?.bars ?? []).filter((bar) => Number.isFinite(bar.value) && bar.value > 0).slice(0, maxBars);
  if (bars.length < 2) return "";
  const max = Math.max(...bars.map((bar) => bar.value));
  if (!(max > 0)) return "";
  if (bars.length <= 3) rowPitch = Math.max(rowPitch, 66);
  const barTop = 330 + dy;
  const barX = 420;
  const trackWidth = 560;
  const rows = bars.map((bar, index) => {
    const y = barTop + index * rowPitch;
    const width = Math.max(34, Math.round((bar.value / max) * (trackWidth - 130)));
    const isMax = bar.value === max;
    const labelSize = Math.min(24, Math.floor(300 / Math.max(1, graphemeCount(bar.label))));
    return `<rect x="${barX}" y="${y}" width="${width}" height="30" rx="15" fill="${isMax ? OG.yellow : OG.side}" stroke="${OG.ink}" stroke-width="3.5"/>
  ${textElement(bar.label, { x: 96, y: y + 3, size: labelSize, weight: fontFiles.bold.weight, color: OG.ink })}
  ${textElement(bar.display, { x: barX + width + 16, y: y + 1, size: 27, weight: fontFiles.bold.weight, color: OG.ink })}`;
  }).join("\n  ");
  return `${textElement(chart.title, { x: 96, y: 288 + dy, size: 25, color: OG.muted })}
  <line x1="${barX}" y1="${barTop - 10}" x2="${barX}" y2="${barTop + (bars.length - 1) * rowPitch + 40}" stroke="${OG.ink}" stroke-width="3" stroke-linecap="round"/>
  ${rows}`;
}

// 右側のイラスト：黄色い天面の箱（資料箱）と、資料カード、街の木。
function motifVisual() {
  const ink = OG.ink;
  const box = (cx, cy, s, h) => `<polygon points="${cx - s},${cy} ${cx},${cy + s * 0.5} ${cx},${cy + s * 0.5 + h} ${cx - s},${cy + h}" fill="#ffffff" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="${cx},${cy + s * 0.5} ${cx + s},${cy} ${cx + s},${cy + h} ${cx},${cy + s * 0.5 + h}" fill="${OG.side}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="${cx},${cy - s * 0.5} ${cx + s},${cy} ${cx},${cy + s * 0.5} ${cx - s},${cy}" fill="${OG.yellow}" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>
  <line x1="${cx - s * 0.5}" y1="${cy - s * 0.25}" x2="${cx + s * 0.5}" y2="${cy + s * 0.25}" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
  ${[0.25, 0.5, 0.75].map((t) => `<line x1="${cx - s + s * t}" y1="${cy + s * 0.5 * t + 18}" x2="${cx - s + s * t}" y2="${cy + s * 0.5 * t + h - 18}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`).join("")}`;
  const tree = (x, y, r) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + r * 1.5}" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="${OG.green}" stroke="${ink}" stroke-width="4"/>`;
  return `<path d="M800 556 L1010 462 L1128 520" fill="none" stroke="${OG.yellow}" stroke-width="7" stroke-dasharray="16 14" stroke-linecap="round"/>
  <g transform="rotate(-5 870 230)">
    <rect x="790" y="140" width="176" height="164" rx="6" fill="#ffffff" stroke="${ink}" stroke-width="4"/>
    <rect x="810" y="164" width="136" height="18" rx="9" fill="${ink}"/>
    <rect x="810" y="198" width="108" height="12" rx="6" fill="${OG.side}" stroke="${ink}" stroke-width="2.5"/>
    <rect x="810" y="224" width="124" height="12" rx="6" fill="${OG.side}" stroke="${ink}" stroke-width="2.5"/>
    <rect x="810" y="256" width="72" height="22" rx="11" fill="${OG.yellow}" stroke="${ink}" stroke-width="3"/>
  </g>
  ${box(1040, 342, 100, 112)}
  ${tree(1108, 206, 28)}
  ${tree(830, 452, 22)}`;
}

function renderSvg({ title, label, date, type, chart }) {
  const typeWidth = 44 + [...type].length * 18;
  const hasChart = Boolean(chartVisual(chart));
  let chartDy = 0;
  let chartPitch = 52;
  let chartMaxBars = 5;
  let layout;
  if (hasChart) {
    // 禁則の都合で特定のサイズ階梯だけ配置できないタイトルがあるため、
    // 階梯を変えた候補を順に試す。3行になる場合はグラフ側を詰める。
    const attempts = [
      { options: { maxLines: 2, maxWidth: 1000, fontSizes: [46, 42, 38, 34, 30] }, dy: 0, pitch: 50, maxBars: 5 },
      { options: { maxLines: 2, maxWidth: 1000 }, dy: 0, pitch: 50, maxBars: 5 },
      { options: { maxLines: 3, maxWidth: 1000, fontSizes: [40, 36, 32, 30] }, dy: 30, pitch: 44, maxBars: 5 },
      { options: { maxLines: 3, maxWidth: 1000 }, dy: 84, pitch: 40, maxBars: 4 },
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
    for (const options of [
      { maxLines: 3, maxWidth: 640, fontSizes: [44, 40, 36, 32] },
      { maxLines: 3, maxWidth: 640 },
      { maxLines: 4, maxWidth: 640, fontSizes: [34, 32, 30, 28] },
      { maxLines: 4, maxWidth: 640 },
    ]) {
      try { layout = layoutOgTitle(title, options); break; } catch { /* 次の候補へ */ }
    }
    if (!layout) throw new Error(`OGタイトルを配置できません: ${title}`);
  }
  const titleHeight = layout.fontSize + (layout.lines.length - 1) * layout.lineHeight;
  const firstLineTop = hasChart ? 138 : Math.round(338 - titleHeight / 2);
  const titleLines = layout.lines.map((line, index) => textElement(line, {
    x: 96,
    y: firstLineTop + index * layout.lineHeight,
    size: layout.fontSize,
    weight: fontFiles.bold.weight,
    color: OG.ink,
  })).join("");
  const underline = hasChart ? "" : `<rect x="96" y="${firstLineTop + titleHeight + 26}" width="120" height="10" rx="5" fill="${OG.yellow}" stroke="${OG.ink}" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <rect width="1200" height="675" fill="${OG.paper}"/>
  <rect x="34" y="34" width="1144" height="619" rx="40" fill="${OG.ink}"/>
  <rect x="24" y="24" width="1144" height="619" rx="40" fill="${OG.card}" stroke="${OG.ink}" stroke-width="6"/>
  ${hasChart ? "" : `<rect x="764" y="58" width="378" height="510" rx="30" fill="${OG.yellowPale}"/>`}
  ${hasChart ? chartVisual(chart, chartDy, chartPitch, chartMaxBars) : motifVisual()}
  <rect x="96" y="62" width="66" height="52" rx="12" fill="${OG.yellow}" stroke="${OG.ink}" stroke-width="4"/>
  <text x="129" y="74" text-anchor="middle" dominant-baseline="hanging" fill="${OG.ink}" font-family="${fontFamily}" font-size="26" font-weight="700">CA</text>
  <rect x="178" y="64" width="${typeWidth}" height="48" rx="24" fill="${OG.ink}"/>
  <text x="${178 + typeWidth / 2}" y="76" text-anchor="middle" dominant-baseline="hanging" fill="#ffffff" font-family="${fontFamily}" font-size="24" font-weight="700" letter-spacing="1">${esc(type)}</text>
  ${textElement(label, { x: 178 + typeWidth + 20, y: 74, size: 27, weight: fontFiles.bold.weight, color: OG.ink })}
  ${titleLines}
  ${underline}
  <line x1="96" y1="584" x2="1104" y2="584" stroke="${OG.ink}" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>
  ${textElement("manapick", { x: 96, y: 598, size: 30, weight: fontFiles.bold.weight, color: OG.ink })}
  <rect x="270" y="596" width="118" height="38" rx="8" fill="${OG.yellow}"/>
  <text x="329" y="603" text-anchor="middle" dominant-baseline="hanging" fill="${OG.ink}" font-family="${fontFamily}" font-size="24" font-weight="700" letter-spacing="2">CAREER</text>
  <text x="1104" y="604" text-anchor="end" dominant-baseline="hanging" fill="${OG.muted}" font-family="${fontFamily}" font-size="21">${esc(date ? `career.manapick.app　・　${date}` : "career.manapick.app")}</text>
  </svg>`;
}

// 手で作って管理している画像。生成処理からは書き込まない（上書き防止）。
const HAND_MADE_IMAGES = new Set([path.join(root, "public/og.png")]);

async function render(item, type, directory, outputPath) {
  const output = path.resolve(outputPath ?? path.join(outputRoot, directory, `${item.slug}.png`));
  if (HAND_MADE_IMAGES.has(output)) throw new Error(`手作りの画像は生成処理で上書きしません: ${path.relative(root, output)}`);
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
      // 記事カバー（OG）の札も表示用の7分類で描く（独立監査2 2026-11-19 M1）。記事データの kind は変えない
      label: newsTopicFor(item.slug, item.label ?? item.kind),
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
// サイト共通の OG 画像 public/og.png は手で作った画像（1e493af で6駅の型にそろえたもの）をそのまま使う。
// 以前はここで生成画像を public/og.png に書き込んでおり、og:generate（prebuild・qa）のたびに上書きされていた。
// 生成しないうえで、万一ほかの処理から書き込もうとした場合も render() で止める。
console.log(`OG generated with BIZ UDPGothic font files: newsArticles=${newsWithPublication.length} newsIndex=1 guides=${guides.length} guideIndex=1 careers=${careers.length}`);
