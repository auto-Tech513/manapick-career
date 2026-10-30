// 一覧カード専用サムネイル（800x420 PNG）をローカル生成する。
// デザイン方針（2026-10-30 刷新）: AI生成風の抽象グラデーションをやめ、
// 白地＋紺の額縁＋黄色アクセントの「編集物の表紙」デザインに統一する。
// 中面は記事ごとに異なる実データを使う:
//   - グラフ対象記事: 本文の公表値で作ったミニ棒グラフ（content/article-charts.ts）
//   - ニュース: 答えの文から抜いた見出し数値（キャプションは本文の逐語部分文字列）
//   - その他: 分類グリフのスタンプ＋文書線モチーフ
// タイトル文字・ロゴは入れない（カード上の見出しと衝突させない）。
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
const newsAnswerBySlug = new Map(expandedNews.map((n) => [n.slug, n.answer ?? ""]));

// グラフデータ（TypeScriptファイル）を正規表現で読み取る。バーの label/value/display だけを使う。
const chartsText = fs.readFileSync(path.join(root, "content/article-charts.ts"), "utf8");
const chartBySlug = new Map();
for (const blockMatch of chartsText.matchAll(/"([a-z0-9-]+)": \{\n([\s\S]*?)\n  \},/g)) {
  const bars = [...blockMatch[2].matchAll(/label: "([^"]+)", value: ([0-9.]+), display: "([^"]+)"/g)].map((m) => ({
    label: m[1],
    value: parseFloat(m[2]),
    display: m[3],
  }));
  if (bars.length >= 2) chartBySlug.set(blockMatch[1], bars);
}

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
  { test: (c) => c === "職業の違い", glyph: "違" },
  { test: (c) => ["AI活用", "AI検証"].includes(c), glyph: "AI" },
  { test: (c) => ["資格と応募", "資格の確認"].includes(c), glyph: "資" },
  { test: (c) => ["学び方", "学習ルート", "学習計画", "学習設計", "動画学習", "上達確認", "講座比較"].includes(c), glyph: "学" },
  { test: (c) => ["職業を試す", "成果物づくり", "経験の棚卸し", "経験の伝え方"].includes(c), glyph: "試" },
  { test: () => true, glyph: "確" },
];
const NEWS_GLYPH = {
  "雇用統計": "統", "賃金・労働時間": "賃", "賃金・制度": "制", "雇用・制度": "制",
  "両立・制度": "両", "AI・DX": "AI", "デジタル人材": "デ", "人材育成": "育",
  "働き方": "働", "働き方・白書": "書", "キャリア形成": "進", "新卒採用": "卒",
  "教育・採用": "教", "医療・資格": "医", "雇用・労働": "労", "産業・白書": "書",
  "産業・統計": "産", "家計・統計": "家", "労働統計": "労", "労働安全": "安",
};

function glyphFor(kind, label) {
  if (kind === "guide") return GUIDE_STYLE.find((s) => s.test(label)).glyph;
  if (NEWS_GLYPH[label]) return NEWS_GLYPH[label];
  return [...label].find((ch) => /[一-龯]/.test(ch)) ?? "記";
}

const INK = "#172033";
const YELLOW = "#ffd700";
const PAPER = "#ffffff";
const FAINT = "#e3e8f2";

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 答えの文から見出し数値と、その直前の句（キャプション）を抜く。
// キャプションは本文の逐語部分文字列でなければならない（言い換えをしない）。
// 途中で切れて語句が壊れる場合は数値カードにせず、スタンプ型に落とす。
const FIGURE_OVERRIDES = {
  // 答えの冒頭に「事業所規模5人以上」が来て自動抽出がずれるため、見出し数値を手で指定（どちらも本文の逐語）
  "monthly-earnings-august-2026": { figure: "311,364円", caption: "現金給与総額" },
  // 最初の％が前年比の増減で見出しに不向きなため、死亡者数を指定（どちらも本文の逐語）
  "workplace-accidents-latest": { figure: "700人", caption: "死亡者数" },
};
// 自動抽出の数値が見出しとして弱い記事はスタンプ型にする
const FIGURE_SKIP = new Set(["employment-whitepaper-2026"]);

function captionSegment(answer, index) {
  const before = answer.slice(0, index);
  const start = Math.max(before.lastIndexOf("。"), before.lastIndexOf("、")) + 1;
  return before
    .slice(start)
    .replace(/^(結論として|つまり|なお|また|一方|具体的には)/, "")
    .trim()
    .replace(/(は|が|の|を|に|へ|と|で|も)$/, "");
}

function extractFigure(answer, slug) {
  if (!answer) return null;
  if (FIGURE_SKIP.has(slug)) return null;
  if (FIGURE_OVERRIDES[slug]) return FIGURE_OVERRIDES[slug];
  // 第一優先: 円・％・倍（金額と割合は見出しとして意味が立つ）
  const primary = answer.match(/[0-9][0-9,]*\.?[0-9]*\s*(?:円|％|%|倍)/);
  if (primary) {
    const caption = captionSegment(answer, primary.index);
    if (caption.length >= 3 && caption.length <= 20) return { figure: primary[0].replace(/\s+/g, ""), caption };
    return null;
  }
  // 第二優先: 人・件・時間・ポイント（キャプションが十分ある場合だけ）
  const secondary = answer.match(/[0-9][0-9,]*\.?[0-9]*\s*(?:人|件|時間|ポイント)/);
  if (secondary) {
    const caption = captionSegment(answer, secondary.index);
    if (caption.length >= 4 && caption.length <= 20) return { figure: secondary[0].replace(/\s+/g, ""), caption };
  }
  return null;
}

function chip(label) {
  const width = 44 + [...label].length * 24;
  return `<rect x="46" y="40" width="${width}" height="42" rx="21" fill="${INK}"/>
  <text x="${46 + width / 2}" y="70" text-anchor="middle" fill="#ffffff" font-family="${fontFamily}" font-size="21" font-weight="700">${escapeXml(label)}</text>`;
}

function frame() {
  return `<rect width="800" height="420" fill="${PAPER}"/>
  <rect x="14" y="14" width="772" height="392" fill="none" stroke="${INK}" stroke-width="5"/>
  <rect x="0" y="378" width="800" height="42" fill="${INK}"/>
  <rect x="0" y="378" width="220" height="42" fill="${YELLOW}"/>`;
}

function renderChartSvg(label, bars) {
  const max = Math.max(...bars.map((b) => b.value));
  const top = 118;
  const rowH = Math.min(40, (368 - top) / bars.length);
  const barH = Math.min(20, rowH - 14);
  // ラベルが長いカードではラベルを小さくし、棒の開始位置を後ろへずらす（重なり防止）
  const labelSize = (text) => (text.length > 11 ? 15 : 19);
  const labelWidth = (text) => [...text].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? labelSize(text) : labelSize(text) * 0.55), 0);
  const barX = Math.min(330, Math.max(250, 46 + Math.max(...bars.map((b) => labelWidth(b.label))) + 16));
  const trackW = 630 - barX;
  const rows = bars.map((bar, i) => {
    const y = top + i * rowH;
    const w = Math.max(10, (bar.value / max) * trackW);
    const fill = bar.value === max ? YELLOW : INK;
    return `<text x="46" y="${y + barH - 4}" fill="${INK}" font-family="${fontFamily}" font-size="${labelSize(bar.label)}" font-weight="700">${escapeXml(bar.label)}</text>
  <rect x="${barX}" y="${y}" width="${trackW}" height="${barH}" fill="${FAINT}"/>
  <rect x="${barX}" y="${y}" width="${w}" height="${barH}" fill="${fill}"/>
  <text x="646" y="${y + barH - 3}" fill="${INK}" font-family="${fontFamily}" font-size="21" font-weight="700">${escapeXml(bar.display)}</text>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
  ${frame()}
  ${chip(label)}
  ${rows}
</svg>`;
}

function renderFigureSvg(label, { figure, caption }) {
  const figSize = figure.length > 9 ? 92 : figure.length > 7 ? 108 : 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
  ${frame()}
  ${chip(label)}
  ${caption ? `<text x="400" y="172" text-anchor="middle" fill="${INK}" font-family="${fontFamily}" font-size="30" font-weight="700">${escapeXml(caption)}</text>` : ""}
  <text x="400" y="${caption ? 324 : 286}" text-anchor="middle" fill="${INK}" font-family="${fontFamily}" font-size="${figSize}" font-weight="700">${escapeXml(figure)}</text>
  <rect x="330" y="${caption ? 346 : 306}" width="140" height="8" fill="${YELLOW}"/>
</svg>`;
}

function renderStampSvg(label, glyph) {
  const isLatin = glyph.length > 1;
  const glyphSize = isLatin ? 92 : 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
  ${frame()}
  ${chip(label)}
  <rect x="76" y="126" width="196" height="196" fill="${YELLOW}"/>
  <rect x="62" y="112" width="196" height="196" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
  <text x="160" y="${isLatin ? 238 : 262}" text-anchor="middle" fill="${INK}" font-family="${fontFamily}" font-size="${glyphSize}" font-weight="700">${escapeXml(glyph)}</text>
  <rect x="330" y="150" width="330" height="16" fill="${INK}"/>
  <rect x="330" y="196" width="264" height="16" fill="${INK}" opacity="0.55"/>
  <rect x="330" y="242" width="300" height="16" fill="${INK}" opacity="0.3"/>
  <rect x="330" y="288" width="180" height="16" fill="${YELLOW}"/>
</svg>`;
}

function render(item) {
  const bars = chartBySlug.get(item.slug);
  let svg;
  if (bars) {
    svg = renderChartSvg(item.label, bars);
  } else if (item.kind === "news") {
    const figure = extractFigure(newsAnswerBySlug.get(item.slug) ?? "", item.slug);
    svg = figure ? renderFigureSvg(item.label, figure) : renderStampSvg(item.label, glyphFor(item.kind, item.label));
  } else {
    svg = renderStampSvg(item.label, glyphFor(item.kind, item.label));
  }
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
for (const g of pickBase("const baseGuides", "guide")) items.push(g);
for (const g of expandedGuides) if (g.status === "published") items.push({ slug: g.slug, label: g.category, kind: "guide" });
for (const n of pickBase("const newsItemsData", "news")) if (publishedNewsSlugs.has(n.slug)) items.push(n);
for (const n of expandedNews) if (publishedNewsSlugs.has(n.slug)) items.push({ slug: n.slug, label: n.kind, kind: "news" });

const seen = new Set();
let count = 0;
const typeCount = { chart: 0, figure: 0, stamp: 0 };
for (const item of items) {
  const key = `${item.kind}/${item.slug}`;
  if (seen.has(key)) continue;
  seen.add(key);
  render(item);
  count += 1;
  if (chartBySlug.has(item.slug)) typeCount.chart += 1;
  else if (item.kind === "news" && extractFigure(newsAnswerBySlug.get(item.slug) ?? "", item.slug)) typeCount.figure += 1;
  else typeCount.stamp += 1;
}
console.log(`card images generated: ${count} (chart ${typeCount.chart} / figure ${typeCount.figure} / stamp ${typeCount.stamp})`);
