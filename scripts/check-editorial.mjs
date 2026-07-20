import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const file = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const registry = JSON.parse(fs.readFileSync(path.join(root, "content/source-registry.json"), "utf8"));
const expandedNews = JSON.parse(fs.readFileSync(path.join(root, "content/news-expanded.json"), "utf8"));
const sourceIds = new Set(registry.map((source) => source.sourceId));
const failures = [];
const slugs = new Set();
const expectedOgImages = [];
const expandedArticleCores = [];
const require = createRequire(import.meta.url);

const ogGenerator = fs.readFileSync(path.join(root, "scripts/generate-og.mjs"), "utf8");
const fontPackagePath = require.resolve("@expo-google-fonts/noto-sans-jp/package.json");
const fontPackage = JSON.parse(fs.readFileSync(fontPackagePath, "utf8"));
const fontPackageRoot = path.dirname(fontPackagePath);
const requiredJapaneseFonts = [
  path.join(fontPackageRoot, "500Medium/NotoSansJP_500Medium.ttf"),
  path.join(fontPackageRoot, "700Bold/NotoSansJP_700Bold.ttf"),
];

if (!String(fontPackage.license).includes("OFL-1.1")) failures.push("OG用Noto Sans JPのOFL-1.1ライセンスを確認できない");
for (const fontFile of requiredJapaneseFonts) if (!fs.existsSync(fontFile)) failures.push(`OG用日本語フォントなし: ${fontFile}`);
if (!ogGenerator.includes("fontfile: fontFace.file") || !ogGenerator.includes("fontfile: fontFiles.bold.file")) {
  failures.push("OG生成処理が日本語フォントファイルを明示していない");
}

function trigramSet(value) {
  const normalized = String(value).replace(/\s+/g, "");
  const grams = new Set();
  for (let index = 0; index <= normalized.length - 3; index += 1) grams.add(normalized.slice(index, index + 3));
  return grams;
}

function jaccard(left, right) {
  let intersection = 0;
  for (const gram of left) if (right.has(gram)) intersection += 1;
  return intersection / (left.size + right.size - intersection || 1);
}

const arrays = [...file.matchAll(/(?:export const guides|const newsItemsData):[^=]+?= \[([\s\S]*?)\n\];/g)].map((match) => [match[0].startsWith("export const guides") ? "guides" : "newsItems", match[1]]);
for (const [collection, source] of arrays) {
  const items = source.split(/\n  \{\n    slug:/).slice(1).map((chunk) => `slug:${chunk}`);
  for (const item of items) {
    const slug = item.match(/slug:\s*"([^"]+)"/)?.[1] ?? "unknown";
    if (slugs.has(slug)) failures.push(`${collection}/${slug}: slug重複`);
    slugs.add(slug);
    expectedOgImages.push(path.join(root, "public", "og", "jp-v2", collection === "guides" ? "guide" : "news", `${slug}.png`));
    const body = item.match(/sections:\s*\[([\s\S]*)/)?.[1] ?? "";
    const prose = [...body.matchAll(/"([^"\n]{20,})"/g)].map((match) => match[1]).join("");
    if (prose.length < 1000) failures.push(`${collection}/${slug}: 本文が${prose.length}字で1000字未満`);
    if (!/answer:\s*"[^"\n]{50,}"/.test(item)) failures.push(`${collection}/${slug}: 要約回答が不足`);
    if (!/keyPoints:\s*\[[\s\S]*?"[^"]+"[\s\S]*?"[^"]+"[\s\S]*?"[^"]+"/.test(item)) failures.push(`${collection}/${slug}: 要点が3件未満`);
    const ids = [...item.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]);
    if (ids.length < 4 || new Set(ids).size !== ids.length) failures.push(`${collection}/${slug}: 目次IDが4件未満または重複`);
    const linkedSources = item.match(/sourceIds:\s*\[([^\]]+)\]/)?.[1]?.match(/"([^"]+)"/g)?.map((id) => id.slice(1, -1)) ?? [];
    if (!linkedSources.length) failures.push(`${collection}/${slug}: 出典なし`);
    for (const id of linkedSources) if (!sourceIds.has(id)) failures.push(`${collection}/${slug}: 未登録sourceId ${id}`);
  }
}

const generatedProse = [
  "公表日の新しさだけで『最新』と判断せず、調査対象、基準時点、速報か確報か、集計単位を確認します。本記事は元資料を独自に要約し、数字や文言を別媒体から転載していません。確認日は編集部が一次資料とリンクを実際に見直した日であり、ビルド日には置き換えません。",
  "一つの指標は、労働市場や職場の一面だけを示します。前月比と前年同月比、全国と地域、平均と分布、求人側と働く側を分け、必要なら別の一次資料を組み合わせます。職業名だけで結論を作らず、実際の仕事内容、雇用形態、経験条件、勤務場所まで戻って確認するのがmanapick careerの読み方です。",
  "調査結果は、個人の適性、採用可能性、転職成功率、将来の賃金を保証しません。割合が高い項目を人気職業やおすすめ順位へ変換せず、少数派の回答を失敗とも扱いません。制度、求人条件、製品仕様は変わるため、応募、契約、受講、購入の直前には必ず公式情報を再確認してください。",
  "最初に元資料の調査概要と注記を読み、次に自分が検討する職種・地域・働き方の条件へ絞り、最後に一つの小さな確認行動を決めます。不安を煽る期限、根拠のない希少性、連続閲覧を促す報酬は使いません。記事を閉じても、確認した出典と次の行動が手元に残ることを優先します。",
].join("");
for (const item of expandedNews) {
  const slug = item.slug ?? "unknown";
  if (slugs.has(slug)) failures.push(`newsItems/${slug}: slug重複`);
  slugs.add(slug);
  expectedOgImages.push(path.join(root, "public", "og", "jp-v2", "news", `${slug}.png`));
  const articleCore = ["whatHappened", "howToRead", "whatNotToConclude", "nextActions"].flatMap((key) => item[key] ?? []).join("");
  const prose = articleCore + generatedProse;
  if (prose.length < 1000) failures.push(`newsItems/${slug}: 生成本文が${prose.length}字で1000字未満`);
  if (articleCore.length < 500) failures.push(`newsItems/${slug}: 共通編集注記を除く独自本文が${articleCore.length}字で500字未満`);
  expandedArticleCores.push({ slug, grams: trigramSet(articleCore) });
  if (String(item.answer ?? "").length < 50) failures.push(`newsItems/${slug}: 要約回答が不足`);
  if (!Array.isArray(item.keyPoints) || item.keyPoints.length < 3) failures.push(`newsItems/${slug}: 要点が3件未満`);
  if (!Array.isArray(item.sourceIds) || !item.sourceIds.length) failures.push(`newsItems/${slug}: 出典なし`);
  for (const id of item.sourceIds ?? []) if (!sourceIds.has(id)) failures.push(`newsItems/${slug}: 未登録sourceId ${id}`);
}

for (let left = 0; left < expandedArticleCores.length; left += 1) {
  for (let right = left + 1; right < expandedArticleCores.length; right += 1) {
    const similarity = jaccard(expandedArticleCores[left].grams, expandedArticleCores[right].grams);
    if (similarity >= 0.2) {
      failures.push(`newsItems/${expandedArticleCores[left].slug} と ${expandedArticleCores[right].slug}: 共通編集注記を除く本文類似度 ${(similarity * 100).toFixed(1)}%`);
    }
  }
}

const baseNewsCount = arrays.find(([collection]) => collection === "newsItems")?.[1].split(/\n  \{\n    slug:/).slice(1).length ?? 0;
if (baseNewsCount + expandedNews.length !== 30) failures.push(`ニュース件数が${baseNewsCount + expandedNews.length}件（30件必須）`);

if (/kind:\s*"(?:機能改善|編集情報|公開情報)"/.test(file)) failures.push("ニュースにサイト更新情報が混入");

for (const image of expectedOgImages) {
  if (!fs.existsSync(image)) {
    failures.push(`${path.relative(root, image)}: 記事固有OG画像なし`);
    continue;
  }
  const metadata = await sharp(image).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630 || metadata.format !== "png") {
    failures.push(`${path.relative(root, image)}: OG画像が1200×630 PNGではない`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`editorial check: guides/news are long-form, sourced, TOC-ready; OG font=Noto Sans JP explicit TTF; news=${baseNewsCount + expandedNews.length}`);
