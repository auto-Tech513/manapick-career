// 記事グラフ（content/article-charts.ts）の数値が、対象記事の本文に実際に
// 載っている公表値と一致するかを照合する。グラフ用に新しい数字を作らないための検査。
// 使い方: node --experimental-strip-types scripts/check-article-charts.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { articleCharts } = await import(path.join(root, "content/article-charts.ts"));
const { articleFigures, articleItems } = await import(path.join(root, "content/article-visuals.ts"));

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const news = readJson("content/news-expanded.json");
const guidesRaw = readJson("content/guides-expanded.json");
const guides = Array.isArray(guidesRaw) ? guidesRaw : guidesRaw.guides ?? [];

function allText(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allText(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allText(v, out));
  return out;
}

const articles = new Map();
for (const item of [...news, ...guides]) {
  if (item && item.slug) articles.set(item.slug, allText(item).join("\n"));
}

// base記事（content/editorial.ts 内のオブジェクト）は slug の出現位置から次の slug までを本文として切り出す
const editorialTs = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const slugPositions = [...editorialTs.matchAll(/slug:\s*"([a-z0-9-]+)"/g)];
for (let i = 0; i < slugPositions.length; i += 1) {
  const slug = slugPositions[i][1];
  if (articles.has(slug)) continue;
  const start = slugPositions[i].index;
  const end = i + 1 < slugPositions.length ? slugPositions[i + 1].index : editorialTs.length;
  articles.set(slug, editorialTs.slice(start, end));
}

const normalize = (s) => s.replace(/％/g, "%").replace(/，/g, ",").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
const numTokens = (s) => new Set([...normalize(s).matchAll(/[0-9][0-9,]*\.?[0-9]*/g)].map((m) => m[0].replace(/,/g, "")));
const parseDisplay = (display) => {
  const m = normalize(display).match(/[0-9][0-9,]*\.?[0-9]*/);
  return m ? parseFloat(m[0].replace(/,/g, "")) : NaN;
};

const failures = [];
let barCount = 0;
for (const [slug, chart] of Object.entries(articleCharts)) {
  const text = articles.get(slug);
  if (!text) {
    failures.push(`${slug}: 対象記事が見つからない`);
    continue;
  }
  if (!Array.isArray(chart.bars) || chart.bars.length < 2) failures.push(`${slug}: バーが2本未満`);
  const articleNums = numTokens(text);
  for (const part of [chart.title, chart.note ?? "", ...chart.bars.map((b) => b.label)]) {
    for (const token of numTokens(part)) {
      if (!articleNums.has(token)) failures.push(`${slug}: グラフ内テキストの数字「${token}」が本文にない（${part.slice(0, 30)}…）`);
    }
  }
  for (const bar of chart.bars) {
    barCount += 1;
    if (!text.includes(bar.display)) failures.push(`${slug}: 表示値「${bar.display}」が本文に逐語で存在しない`);
    const parsed = parseDisplay(bar.display);
    if (Number.isNaN(parsed) || Math.abs(parsed - bar.value) > 0.001) failures.push(`${slug}: 表示値「${bar.display}」と value=${bar.value} が不一致`);
    if (!(bar.value > 0)) failures.push(`${slug}: value が正でない（${bar.label}）`);
  }
}

// キーフィギュア: 表示値が本文に逐語で存在し、ラベル等の数字が本文の数字だけであること
let figureCount = 0;
for (const [slug, figures] of Object.entries(articleFigures)) {
  const text = articles.get(slug);
  if (!text) {
    failures.push(`${slug}: （figures）対象記事が見つからない`);
    continue;
  }
  const articleNums = numTokens(text);
  for (const part of [figures.title, figures.note ?? "", ...figures.items.map((i) => i.label)]) {
    for (const token of numTokens(part)) {
      if (!articleNums.has(token)) failures.push(`${slug}: （figures）テキストの数字「${token}」が本文にない（${part.slice(0, 30)}…）`);
    }
  }
  for (const item of figures.items) {
    figureCount += 1;
    if (!text.includes(item.display)) failures.push(`${slug}: （figures）表示値「${item.display}」が本文に逐語で存在しない`);
  }
}

// 項目の図解: 用語・説明が本文の逐語部分文字列であること
let itemCount = 0;
for (const [slug, items] of Object.entries(articleItems)) {
  const text = articles.get(slug);
  if (!text) {
    failures.push(`${slug}: （items）対象記事が見つからない`);
    continue;
  }
  const articleNums = numTokens(text);
  for (const token of numTokens(items.title)) {
    if (!articleNums.has(token)) failures.push(`${slug}: （items）タイトルの数字「${token}」が本文にない`);
  }
  for (const row of items.items) {
    itemCount += 1;
    if (!text.includes(row.term)) failures.push(`${slug}: （items）用語「${row.term}」が本文に逐語で存在しない`);
    if (row.text && !text.includes(row.text)) failures.push(`${slug}: （items）説明「${row.text}」が本文に逐語で存在しない`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`article charts check: ${Object.keys(articleCharts).length} charts / ${barCount} bars — all values verbatim in article text`);
console.log(`article visuals check: ${Object.keys(articleFigures).length} figures / ${figureCount} values, ${Object.keys(articleItems).length} item sets / ${itemCount} rows — all verbatim in article text`);
