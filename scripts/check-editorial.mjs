import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { layoutOgTitle, validateOgTitleLayout } from "./lib/og-title-layout.mjs";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const editorialSource = read("content/editorial.ts");
const expandedGuides = json("content/guides-expanded.json");
const expandedNews = json("content/news-expanded.json");
const claimRegistry = json("content/guide-claim-registry.json");
const sourceRegistry = json("content/source-registry.json");
const networkMap = json("content/network-map.json");
const networkQa = json("docs/qa-network.json");
const ogGenerator = read("scripts/generate-og.mjs");
const editorialArticle = read("components/EditorialArticle.tsx");
const guideIndex = read("app/guide/page.tsx");
const guidePage = read("app/guide/[slug]/page.tsx");
const sitemap = read("app/sitemap.ts");
const llms = read("app/llms.txt/route.ts");
const preview = read("components/EditorialPreview.tsx");
const failures = [];
const warnings = [];
const require = createRequire(import.meta.url);
const today = new Date(`${process.env.CONTENT_CHECK_DATE ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`);

const sourceIds = new Set(sourceRegistry.map((source) => source.sourceId));
const claimsBySlug = new Map(claimRegistry.map((record) => [record.guideSlug, record.claims]));
const qaByItemId = new Map((networkQa.report ?? []).map((item) => [item.itemId, item]));

function extractArray(marker) {
  const start = editorialSource.indexOf(marker);
  const end = editorialSource.indexOf("\n];", start);
  if (start < 0 || end < 0) return [];
  return editorialSource.slice(start, end).split(/\n  \{\n    slug:/).slice(1).map((chunk) => `slug:${chunk}`);
}

function quotedValues(fragment) {
  return [...String(fragment).matchAll(/"([^"\n]+)"/g)].map((match) => match[1]);
}

function field(item, name) {
  return item.match(new RegExp(`${name}:\\s*"([^"]+)"`))?.[1] ?? "";
}

function listField(item, name) {
  const value = item.match(new RegExp(`${name}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";
  return quotedValues(value);
}

function baseGuideFromSource(item) {
  const sections = item.match(/sections:\s*\[([\s\S]*)/)?.[1] ?? "";
  const networkBlock = item.match(/networkLinks:\s*resolveNetworkLinks\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  const networkLinks = [...networkBlock.matchAll(/\{\s*siteId:\s*"([^"]+)",\s*itemId:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*description:\s*"([^"]+)"\s*\}/g)]
    .map((match) => ({ siteId: match[1], itemId: match[2], label: match[3], description: match[4] }));
  return {
    slug: field(item, "slug"),
    title: field(item, "title"),
    category: field(item, "category"),
    status: field(item, "status"),
    publishedAt: field(item, "publishedAt"),
    checkedAt: field(item, "checkedAt"),
    reviewedAt: field(item, "reviewedAt"),
    reviewedBy: /reviewedBy:\s*editor/.test(item) ? "manapick編集責任者" : field(item, "reviewedBy"),
    reviewedByHumanAt: field(item, "reviewedByHumanAt"),
    answer: field(item, "answer"),
    keyPoints: listField(item, "keyPoints"),
    sourceIds: listField(item, "sourceIds"),
    sectionsText: quotedValues(sections).filter((value) => value.length >= 20).join(""),
    sectionIds: [...sections.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]),
    networkLinks,
  };
}

function baseNewsFromSource(item) {
  const sections = item.match(/sections:\s*\[([\s\S]*)/)?.[1] ?? "";
  return {
    slug: field(item, "slug"),
    title: field(item, "title"),
    answer: field(item, "answer"),
    sourceIds: listField(item, "sourceIds"),
    keyPoints: listField(item, "keyPoints"),
    sectionsText: quotedValues(sections).filter((value) => value.length >= 20).join(""),
    sectionIds: [...sections.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]),
  };
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

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function absoluteNetworkUrl(itemId) {
  const item = networkMap.items?.[itemId];
  const site = item ? networkMap.sites?.[item.siteId] : null;
  if (!item || !site) return null;
  return new URL(item.path, `${site.baseUrl}/`).toString();
}

function validateClaimSet(guide) {
  const claims = claimsBySlug.get(guide.slug);
  if (!Array.isArray(claims) || claims.length === 0) {
    failures.push(`guides/${guide.slug}: 重要主張レジストリなし`);
    return;
  }
  const claimIds = new Set();
  for (const claim of claims) {
    if (!claim.claimId || claimIds.has(claim.claimId)) failures.push(`guides/${guide.slug}: claimIdが空または重複`);
    claimIds.add(claim.claimId);
    if (String(claim.text ?? "").length < 20) failures.push(`guides/${guide.slug}/${claim.claimId}: 主張本文が短すぎる`);
    if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0) failures.push(`guides/${guide.slug}/${claim.claimId}: sourceIdsなし`);
    for (const sourceId of claim.sourceIds ?? []) {
      if (!sourceIds.has(sourceId)) failures.push(`guides/${guide.slug}/${claim.claimId}: 未登録sourceId ${sourceId}`);
      if (!guide.sourceIds.includes(sourceId)) failures.push(`guides/${guide.slug}/${claim.claimId}: 記事sourceIdsにない根拠 ${sourceId}`);
    }
    if (!validDate(claim.lastCheckedAt)) failures.push(`guides/${guide.slug}/${claim.claimId}: lastCheckedAtが不正`);
    if (!Number.isInteger(claim.freshnessDays) || claim.freshnessDays <= 0) failures.push(`guides/${guide.slug}/${claim.claimId}: freshnessDaysが正整数ではない`);
    if (typeof claim.critical !== "boolean") failures.push(`guides/${guide.slug}/${claim.claimId}: criticalが真偽値ではない`);
    if (validDate(claim.lastCheckedAt) && Number.isInteger(claim.freshnessDays)) {
      const expiresAt = new Date(`${claim.lastCheckedAt}T00:00:00Z`);
      expiresAt.setUTCDate(expiresAt.getUTCDate() + claim.freshnessDays);
      if (expiresAt < today) {
        const message = `guides/${guide.slug}/${claim.claimId}: 鮮度期限超過 (${claim.lastCheckedAt}+${claim.freshnessDays}日)`;
        if (guide.status === "published" && claim.critical) failures.push(message);
        else warnings.push(message);
      }
    }
  }
}

function validateNetworkLinks(guide) {
  const links = Array.isArray(guide.networkLinks) ? guide.networkLinks : [];
  if (links.length !== 3) failures.push(`guides/${guide.slug}: networkLinksが${links.length}件（3件必須）`);
  if (new Set(links.map((link) => link.itemId)).size !== links.length) failures.push(`guides/${guide.slug}: network itemId重複`);
  const siteIds = new Set(links.map((link) => link.siteId));
  for (const siteId of ["learning", "ai", "license"]) if (!siteIds.has(siteId)) failures.push(`guides/${guide.slug}: ${siteId}連携なし`);
  for (const link of links) {
    if (Object.hasOwn(link, "href")) failures.push(`guides/${guide.slug}: network URLを直接保存している (${link.itemId})`);
    const mapped = networkMap.items?.[link.itemId];
    if (!mapped) {
      failures.push(`guides/${guide.slug}: network-mapにないitemId ${link.itemId}`);
      continue;
    }
    if (mapped.siteId !== link.siteId) failures.push(`guides/${guide.slug}: ${link.itemId}のsiteId不一致`);
    if (!absoluteNetworkUrl(link.itemId)) failures.push(`guides/${guide.slug}: ${link.itemId}の絶対URLを生成不能`);
    const qa = qaByItemId.get(link.itemId);
    if (!qa || qa.state !== "ok") failures.push(`guides/${guide.slug}: 未確認network link ${link.itemId}`);
    if (String(link.label ?? "").length < 8) failures.push(`guides/${guide.slug}: ${link.itemId}のラベルが具体性不足`);
    if (String(link.description ?? "").length < 20) failures.push(`guides/${guide.slug}: ${link.itemId}の説明が20字未満`);
  }
}

function validateGuide(guide) {
  if (!guide.slug || !guide.title) failures.push("guides: slugまたはtitleなし");
  if (String(guide.sectionsText ?? "").length < 1000) failures.push(`guides/${guide.slug}: 本文が${String(guide.sectionsText ?? "").length}字で1000字未満`);
  if (String(guide.answer ?? "").length < 50) failures.push(`guides/${guide.slug}: 要約回答が50字未満`);
  if (!Array.isArray(guide.keyPoints) || guide.keyPoints.length < 3) failures.push(`guides/${guide.slug}: 要点が3件未満`);
  if (!Array.isArray(guide.sectionIds) || guide.sectionIds.length < 4 || new Set(guide.sectionIds).size !== guide.sectionIds.length) failures.push(`guides/${guide.slug}: 目次IDが4件未満または重複`);
  if (!Array.isArray(guide.sourceIds) || guide.sourceIds.length === 0) failures.push(`guides/${guide.slug}: 記事sourceIdsなし`);
  for (const sourceId of guide.sourceIds ?? []) if (!sourceIds.has(sourceId)) failures.push(`guides/${guide.slug}: 未登録sourceId ${sourceId}`);
  if (!["draft", "reviewed", "published"].includes(guide.status)) failures.push(`guides/${guide.slug}: status不正 ${guide.status}`);
  if (guide.status === "published") {
    for (const key of ["publishedAt", "reviewedAt", "reviewedBy", "reviewedByHumanAt"]) {
      if (!guide[key]) failures.push(`guides/${guide.slug}: published条件 ${key} なし`);
    }
  } else if (guide.publishedAt) {
    failures.push(`guides/${guide.slug}: ${guide.status}にpublishedAtが設定されている`);
  }
  validateClaimSet(guide);
  validateNetworkLinks(guide);
  try {
    const layout = layoutOgTitle(guide.title);
    for (const error of validateOgTitleLayout(guide.title, layout.lines)) failures.push(`guides/${guide.slug}: OG改行 ${error}`);
  } catch (error) {
    failures.push(`guides/${guide.slug}: ${error.message}`);
  }
}

const baseGuides = extractArray("const baseGuides").map(baseGuideFromSource);
const expandedGuideModels = expandedGuides.map((guide) => ({
  ...guide,
  sectionsText: (guide.sections ?? []).flatMap((section) => section.paragraphs ?? []).join(""),
  sectionIds: (guide.sections ?? []).map((section) => section.id),
}));
const allGuides = [...baseGuides, ...expandedGuideModels];
const publishedGuides = allGuides.filter((guide) => guide.status === "published");
const draftGuides = allGuides.filter((guide) => guide.status !== "published");

if (expandedGuides.length < 30) failures.push(`追加ガイドが${expandedGuides.length}件（30件以上必須）`);
if (new Set(allGuides.map((guide) => guide.slug)).size !== allGuides.length) failures.push("ガイドslug重複");
if (new Set(allGuides.map((guide) => guide.title)).size !== allGuides.length) failures.push("ガイドtitle重複");
if (new Set(claimRegistry.map((record) => record.guideSlug)).size !== claimRegistry.length) failures.push("guide-claim-registryのguideSlug重複");
for (const record of claimRegistry) if (!allGuides.some((guide) => guide.slug === record.guideSlug)) failures.push(`孤立した主張レジストリ ${record.guideSlug}`);
for (const guide of allGuides) validateGuide(guide);

const guideCores = allGuides.map((guide) => ({ slug: guide.slug, grams: trigramSet(guide.sectionsText) }));
let maxGuideSimilarity = { value: 0, pair: "" };
for (let left = 0; left < guideCores.length; left += 1) {
  for (let right = left + 1; right < guideCores.length; right += 1) {
    const similarity = jaccard(guideCores[left].grams, guideCores[right].grams);
    if (similarity > maxGuideSimilarity.value) maxGuideSimilarity = { value: similarity, pair: `${guideCores[left].slug}/${guideCores[right].slug}` };
    if (similarity >= 0.2) failures.push(`guides/${guideCores[left].slug} と ${guideCores[right].slug}: 本文類似度 ${(similarity * 100).toFixed(1)}%`);
  }
}

if (!editorialSource.includes("export const guideReviewQueue")) failures.push("レビュー待ちキューがない");
if (!editorialSource.includes("guideReviewQueue.filter(isPublishableGuideSeed)")) failures.push("公開条件フィルタがない");
if (!editorialSource.includes("export const publishedGuides")) failures.push("publishedGuides配列がない");
if (!editorialSource.includes("export const guides = publishedGuides")) failures.push("公開面がpublishedGuides限定ではない");
if (!editorialSource.includes("networkUrl(link.itemId)")) failures.push("network-mapから絶対URLを生成していない");
if (!guideIndex.includes(".filter((topic) => topic.guides.length > 0)")) failures.push("0件のガイドトピックを非表示にしていない");
if (![guideIndex, guidePage, preview].every((source) => source.includes("読む") && (source.includes("試す") || source.includes("目安")))) failures.push("読了時間を『読む・試す目安』として表示していない");
if (!editorialArticle.includes("networkLinks.map") || !editorialArticle.includes("target=\"_blank\"")) failures.push("ガイド固有network linkを描画していない");
if (![guidePage, sitemap, llms, preview, guideIndex].every((source) => source.includes("guides"))) failures.push("ガイド公開配列を利用していない公開面がある");

for (const directory of ["app", "components", "lib"]) {
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name) && read(path.relative(root, absolute)).includes("guides-expanded")) failures.push(`${path.relative(root, absolute)}: draftガイドJSONを公開面から直接import`);
    }
  };
  walk(path.join(root, directory));
}

const fontPackagePath = require.resolve("@expo-google-fonts/noto-sans-jp/package.json");
const fontPackage = JSON.parse(fs.readFileSync(fontPackagePath, "utf8"));
const fontRoot = path.dirname(fontPackagePath);
if (!String(fontPackage.license).includes("OFL-1.1")) failures.push("OG用Noto Sans JPのOFL-1.1ライセンスを確認できない");
for (const fontFile of ["500Medium/NotoSansJP_500Medium.ttf", "700Bold/NotoSansJP_700Bold.ttf"]) {
  if (!fs.existsSync(path.join(fontRoot, fontFile))) failures.push(`OG用日本語フォントなし: ${fontFile}`);
}
if (!ogGenerator.includes("fontfile: fontFace.file") || !ogGenerator.includes("fontfile: fontFiles.bold.file")) failures.push("OG生成処理がNoto Sans JPファイルを明示していない");
if (!ogGenerator.includes("layoutOgTitle")) failures.push("OG生成処理が日本語禁則レイアウトを使っていない");
for (const reviewField of ["item.status === \"published\"", "item.publishedAt", "item.reviewedAt", "item.reviewedBy", "item.reviewedByHumanAt"]) {
  if (!ogGenerator.includes(reviewField)) failures.push(`OG公開条件不足: ${reviewField}`);
}

const baseNews = extractArray("const newsItemsData").map(baseNewsFromSource);
const generatedNewsProse = [
  "公表日の新しさだけで『最新』と判断せず、調査対象、基準時点、速報か確報か、集計単位を確認します。本記事は元資料を独自に要約し、数字や文言を別媒体から転載していません。確認日は編集部が一次資料とリンクを実際に見直した日であり、ビルド日には置き換えません。",
  "一つの指標は、労働市場や職場の一面だけを示します。前月比と前年同月比、全国と地域、平均と分布、求人側と働く側を分け、必要なら別の一次資料を組み合わせます。職業名だけで結論を作らず、実際の仕事内容、雇用形態、経験条件、勤務場所まで戻って確認するのがmanapick careerの読み方です。",
  "調査結果は、個人の適性、採用可能性、転職成功率、将来の賃金を保証しません。割合が高い項目を人気職業やおすすめ順位へ変換せず、少数派の回答を失敗とも扱いません。制度、求人条件、製品仕様は変わるため、応募、契約、受講、購入の直前には必ず公式情報を再確認してください。",
  "最初に元資料の調査概要と注記を読み、次に自分が検討する職種・地域・働き方の条件へ絞り、最後に一つの小さな確認行動を決めます。不安を煽る期限、根拠のない希少性、連続閲覧を促す報酬は使いません。記事を閉じても、確認した出典と次の行動が手元に残ることを優先します。",
].join("");
const expandedNewsModels = expandedNews.map((item) => ({
  ...item,
  sectionsText: ["whatHappened", "howToRead", "whatNotToConclude", "nextActions"].flatMap((key) => item[key] ?? []).join("") + generatedNewsProse,
  uniqueText: ["whatHappened", "howToRead", "whatNotToConclude", "nextActions"].flatMap((key) => item[key] ?? []).join(""),
}));
const allNews = [...baseNews, ...expandedNewsModels];
if (new Set(allNews.map((item) => item.slug)).size !== allNews.length) failures.push("ニュースslug重複");
for (const item of allNews) {
  if (item.sectionsText.length < 1000) failures.push(`news/${item.slug}: 本文が${item.sectionsText.length}字で1000字未満`);
  if (String(item.answer ?? "").length < 50) failures.push(`news/${item.slug}: 要約回答が不足`);
  if (!Array.isArray(item.keyPoints) || item.keyPoints.length < 3) failures.push(`news/${item.slug}: 要点が3件未満`);
  for (const sourceId of item.sourceIds ?? []) if (!sourceIds.has(sourceId)) failures.push(`news/${item.slug}: 未登録sourceId ${sourceId}`);
}
if (/kind:\s*"(?:機能改善|編集情報|公開情報)"/.test(editorialSource)) failures.push("ニュースにサイト更新情報が混入");

const newsCores = expandedNewsModels.map((item) => ({ slug: item.slug, grams: trigramSet(item.uniqueText) }));
for (let left = 0; left < newsCores.length; left += 1) {
  for (let right = left + 1; right < newsCores.length; right += 1) {
    const similarity = jaccard(newsCores[left].grams, newsCores[right].grams);
    if (similarity >= 0.2) failures.push(`news/${newsCores[left].slug} と ${newsCores[right].slug}: 独自本文類似度 ${(similarity * 100).toFixed(1)}%`);
  }
}

const expectedPublishedOg = [
  ...publishedGuides.map((guide) => ({ directory: "guide", slug: guide.slug })),
  ...allNews.map((item) => ({ directory: "news", slug: item.slug })),
];
for (const item of expectedPublishedOg) {
  const image = path.join(root, "public/og/jp-v2", item.directory, `${item.slug}.png`);
  if (!fs.existsSync(image)) {
    failures.push(`${path.relative(root, image)}: 公開記事のOG画像なし`);
    continue;
  }
  const size = readPngSize(image);
  if (!size || size.width !== 1200 || size.height !== 630) failures.push(`${path.relative(root, image)}: OG画像が1200×630 PNGではない`);
}
for (const guide of draftGuides) {
  const image = path.join(root, "public/og/jp-v2/guide", `${guide.slug}.png`);
  if (fs.existsSync(image)) failures.push(`${path.relative(root, image)}: draftガイドのOG画像が公開ディレクトリへ混入`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  if (warnings.length) console.warn(`warnings:\n${warnings.join("\n")}`);
  process.exit(1);
}
if (warnings.length) console.warn(`editorial warnings:\n${warnings.join("\n")}`);
console.log(
  `editorial check: totalGuides=${allGuides.length} publishedGuides=${publishedGuides.length} draftGuides=${draftGuides.length} news=${allNews.length}; `
  + `claims=${claimRegistry.reduce((sum, record) => sum + record.claims.length, 0)} network=SSOT/QA-ok maxGuideSimilarity=${(maxGuideSimilarity.value * 100).toFixed(2)}% (${maxGuideSimilarity.pair}) OG=Noto-Sans-JP/Segmenter/kinsoku`,
);
