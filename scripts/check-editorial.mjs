import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { resolveContentCheckDate, tokyoDateString } from "../lib/content-check-date.mjs";
import { layoutOgTitle, validateOgTitleLayout } from "./lib/og-title-layout.mjs";

const root = process.cwd();
const beforeOgGeneration = process.argv.includes("--before-og");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const editorialSource = read("content/editorial.ts");
const networkResolverSource = read("lib/network.ts");
const expandedGuides = json("content/guides-expanded.json");
const expandedNews = json("content/news-expanded.json");
const newsPublication = json("content/news-publication.json");
const claimRegistry = json("content/guide-claim-registry.json");
const sourceRegistry = json("content/source-registry.json");
const networkMap = json("content/network-map.json");
const networkQa = json("docs/qa-network.json");
const ogGenerator = read("scripts/generate-og.mjs");
const editorialArticle = read("components/EditorialArticle.tsx");
const guideIndex = read("app/guide/page.tsx");
const guidePage = read("app/guide/[slug]/page.tsx");
const newsPage = read("app/news/[slug]/page.tsx");
const sitemap = read("app/sitemap.ts");
const llms = read("app/llms.txt/route.ts");
const preview = read("components/EditorialPreview.tsx");
const failures = [];
const warnings = [];
const require = createRequire(import.meta.url);
const today = resolveContentCheckDate(process.env.CONTENT_CHECK_DATE);
if (Number.isNaN(today.valueOf())) failures.push("CONTENT_CHECK_DATEが実在するYYYY-MM-DDではない");
if (tokyoDateString(new Date("2026-07-22T23:00:00Z")) !== "2026-07-23") failures.push("鮮度検査: 08:00 JSTを当日として扱えない");
if (tokyoDateString(new Date("2026-07-23T14:59:59Z")) !== "2026-07-23") failures.push("鮮度検査: JST日付変更直前の暦日が不正");
if (tokyoDateString(new Date("2026-07-23T15:00:00Z")) !== "2026-07-24") failures.push("鮮度検査: JST日付変更後の暦日が不正");

function validateGitReviewEvidence(value, label, reviewedAt) {
  if (!/^git:[0-9a-f]{7,40}$/i.test(String(value))) {
    failures.push(`${label}: reviewEvidenceが追跡不能`);
    return;
  }
  const revision = String(value).slice(4);
  let fullRevision;
  try {
    fullRevision = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    execFileSync("git", ["merge-base", "--is-ancestor", fullRevision, "HEAD"], {
      cwd: root,
      stdio: "ignore",
    });
  } catch {
    failures.push(`${label}: reviewEvidenceのcommitが現在のGit履歴に存在しない (${value})`);
    return;
  }
  try {
    const commitDate = execFileSync("git", ["show", "-s", "--format=%cs", fullRevision], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    if (validDate(reviewedAt) && validDate(commitDate) && commitDate > reviewedAt) {
      failures.push(`${label}: reviewEvidenceのcommit日が人による確認日より後 (${commitDate} > ${reviewedAt})`);
    }
  } catch {
    failures.push(`${label}: reviewEvidenceのcommit日を確認できない (${value})`);
  }
}

const ogNumericLayoutFixtures = [
  { title: "転職希望と実現の差：11.8%を個人の失敗率にしない読み方", protected: ["11.8%"], invalidBoundaryAfter: "11.8" },
  { title: "デジタルスキルはIT職だけではない：APAC600万件超の求人分析を読む", protected: ["APAC600万件"], invalidBoundaryAfter: "APAC600" },
  { title: "全国就業実態パネル調査2026：5万5,894人の数字を読む前の設計確認", protected: ["5万5,894人"], invalidBoundaryAfter: "5万" },
  { title: "2026年7月23日の公開情報を正確に読む", protected: ["2026年7月23日"], invalidBoundaryAfter: "2026年" },
];

for (const fixture of ogNumericLayoutFixtures) {
  try {
    const layout = layoutOgTitle(fixture.title);
    for (const protectedText of fixture.protected) {
      if (!layout.lines.some((line) => line.includes(protectedText))) failures.push(`OG数値・単位保護失敗: ${protectedText}`);
    }
    for (const error of validateOgTitleLayout(fixture.title, layout.lines)) failures.push(`OG数値・単位検査: ${error}`);
    const invalidBoundary = fixture.title.indexOf(fixture.invalidBoundaryAfter) + fixture.invalidBoundaryAfter.length;
    const intentionallyBroken = [fixture.title.slice(0, invalidBoundary), fixture.title.slice(invalidBoundary)];
    if (validateOgTitleLayout(fixture.title, intentionallyBroken).length === 0) failures.push(`OG不正改行を検出できない: ${fixture.invalidBoundaryAfter}`);
  } catch (error) {
    failures.push(`OG数値・単位検査: ${error.message}`);
  }
}

const sourceIds = new Set(sourceRegistry.map((source) => source.sourceId));
const claimsBySlug = new Map(claimRegistry.map((record) => [record.guideSlug, record.claims]));
const qaByItemId = new Map((networkQa.report ?? []).map((item) => [item.itemId, item]));
if (qaByItemId.size !== (networkQa.report ?? []).length) failures.push("network QAのitemId重複");

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
    kind: field(item, "kind"),
    publishedAt: field(item, "publishedAt"),
    checkedAt: field(item, "checkedAt"),
    answer: field(item, "answer"),
    sourceIds: listField(item, "sourceIds"),
    keyPoints: listField(item, "keyPoints"),
    sectionsText: quotedValues(sections).filter((value) => value.length >= 20).join(""),
    sectionIds: [...sections.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]),
  };
}

function sourceSlice(startMarker, endMarker) {
  const start = editorialSource.indexOf(startMarker);
  const end = editorialSource.indexOf(endMarker, start);
  if (start < 0 || end < 0) return "";
  return editorialSource.slice(start, end);
}

const newsSharedImplementation = [
  sourceSlice("function newsNetworkLinks", "function newsClaims"),
  sourceSlice("function newsClaims", "function buildExpandedNews"),
].join("\n");
const expandedNewsBuilderImplementation = sourceSlice("function buildExpandedNews", "const baseGuides");
if (!newsSharedImplementation.trim() || !expandedNewsBuilderImplementation.trim()) {
  failures.push("ニュース本文ハッシュ対象の実装範囲を抽出できない");
}

const newsNetworkReferences = [...newsSharedImplementation.matchAll(/\{\s*siteId:\s*"([^"]+)",\s*itemId:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*description:\s*"([^"]+)"\s*\}/g)]
  .map((match) => ({ siteId: match[1], itemId: match[2], label: match[3], description: match[4] }));
const newsNetworkReferenceByItemId = new Map();
for (const link of newsNetworkReferences) {
  const existing = newsNetworkReferenceByItemId.get(link.itemId);
  if (existing && existing.siteId !== link.siteId) failures.push(`ニュースnetwork linkのsiteId競合: ${link.itemId}`);
  else newsNetworkReferenceByItemId.set(link.itemId, link);
}
if (newsNetworkReferenceByItemId.size === 0) failures.push("ニュースnetwork link候補を抽出できない");

const newsNetworkResolutionSnapshot = [...newsNetworkReferenceByItemId.values()]
  .sort((left, right) => left.itemId.localeCompare(right.itemId))
  .map((link) => {
    const mapped = networkMap.items?.[link.itemId] ?? null;
    const qa = qaByItemId.get(link.itemId) ?? null;
    return {
      itemId: link.itemId,
      declaredSiteId: link.siteId,
      mappedSiteId: mapped?.siteId ?? null,
      resolvedUrl: absoluteNetworkUrl(link.itemId),
      qa: qa ? { url: qa.url, status: qa.status, state: qa.state } : null,
    };
  });

function newsContentDigest(item, networkResolution = newsNetworkResolutionSnapshot) {
  const referencedSources = (item.sourceIds ?? []).map((sourceId) => sourceRegistry.find((source) => source.sourceId === sourceId) ?? null);
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: 2,
    contentSource: item.digestSource,
    sharedImplementation: newsSharedImplementation,
    expandedBuilderImplementation: item.digestKind === "expanded" ? expandedNewsBuilderImplementation : null,
    referencedSources,
    networkResolverImplementation: networkResolverSource,
    networkResolution,
  })).digest("hex");
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

function fontCodePoints(filePath) {
  const buffer = fs.readFileSync(filePath);
  const tableCount = buffer.readUInt16BE(4);
  let cmapOffset = -1;
  for (let index = 0; index < tableCount; index += 1) {
    const record = 12 + index * 16;
    if (buffer.toString("ascii", record, record + 4) === "cmap") {
      cmapOffset = buffer.readUInt32BE(record + 8);
      break;
    }
  }
  if (cmapOffset < 0) throw new Error(`${path.basename(filePath)}: cmapテーブルなし`);
  const subtableCount = buffer.readUInt16BE(cmapOffset + 2);
  const codePoints = new Set();
  const parsedOffsets = new Set();
  for (let index = 0; index < subtableCount; index += 1) {
    const record = cmapOffset + 4 + index * 8;
    const subtableOffset = cmapOffset + buffer.readUInt32BE(record + 4);
    if (parsedOffsets.has(subtableOffset)) continue;
    parsedOffsets.add(subtableOffset);
    const format = buffer.readUInt16BE(subtableOffset);
    if (format === 12) {
      const groupCount = buffer.readUInt32BE(subtableOffset + 12);
      for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
        const group = subtableOffset + 16 + groupIndex * 12;
        const start = buffer.readUInt32BE(group);
        const end = buffer.readUInt32BE(group + 4);
        const startGlyph = buffer.readUInt32BE(group + 8);
        for (let codePoint = start; codePoint <= end; codePoint += 1) {
          if (startGlyph + codePoint - start !== 0) codePoints.add(codePoint);
        }
      }
    } else if (format === 4) {
      const segmentCount = buffer.readUInt16BE(subtableOffset + 6) / 2;
      const endCodes = subtableOffset + 14;
      const startCodes = endCodes + segmentCount * 2 + 2;
      const deltas = startCodes + segmentCount * 2;
      const rangeOffsets = deltas + segmentCount * 2;
      for (let segment = 0; segment < segmentCount; segment += 1) {
        const start = buffer.readUInt16BE(startCodes + segment * 2);
        const end = buffer.readUInt16BE(endCodes + segment * 2);
        const delta = buffer.readInt16BE(deltas + segment * 2);
        const rangeOffset = buffer.readUInt16BE(rangeOffsets + segment * 2);
        for (let codePoint = start; codePoint <= end && codePoint !== 0xffff; codePoint += 1) {
          let glyphId;
          if (rangeOffset === 0) {
            glyphId = (codePoint + delta) & 0xffff;
          } else {
            const glyphAddress = rangeOffsets + segment * 2 + rangeOffset + (codePoint - start) * 2;
            if (glyphAddress + 2 > buffer.length) continue;
            glyphId = buffer.readUInt16BE(glyphAddress);
            if (glyphId !== 0) glyphId = (glyphId + delta) & 0xffff;
          }
          if (glyphId !== 0) codePoints.add(codePoint);
        }
      }
    }
  }
  return codePoints;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function freshnessExpiresAt(lastCheckedAt, freshnessDays) {
  if (!validDate(lastCheckedAt) || !Number.isInteger(freshnessDays) || freshnessDays <= 0) return null;
  const expiresAt = new Date(`${lastCheckedAt}T00:00:00Z`);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + freshnessDays);
  return expiresAt;
}

function freshnessIsExpired(lastCheckedAt, freshnessDays, referenceDate = today) {
  const expiresAt = freshnessExpiresAt(lastCheckedAt, freshnessDays);
  return expiresAt !== null && expiresAt < referenceDate;
}

const freshnessBoundary = new Date("2026-02-15T00:00:00Z");
const freshnessAfterBoundary = new Date("2026-02-16T00:00:00Z");
if (freshnessIsExpired("2026-01-01", 45, freshnessBoundary)) failures.push("鮮度検査: 期限当日を期限超過として扱っている");
if (!freshnessIsExpired("2026-01-01", 45, freshnessAfterBoundary)) failures.push("鮮度検査: 期限翌日の超過を検出できない");
if (freshnessExpiresAt("2026-02-30", 45) !== null) failures.push("鮮度検査: 存在しない確認日を受理している");
if (freshnessExpiresAt("2026-01-01", 0) !== null) failures.push("鮮度検査: 0日のfreshnessDaysを受理している");

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

function validateResolvedNetworkLink(link, label) {
  if (Object.hasOwn(link, "href")) failures.push(`${label}: network URLを直接保存している (${link.itemId})`);
  const mapped = networkMap.items?.[link.itemId];
  if (!mapped) {
    failures.push(`${label}: network-mapにないitemId ${link.itemId}`);
    return;
  }
  if (mapped.siteId !== link.siteId) failures.push(`${label}: ${link.itemId}のsiteId不一致`);
  const resolvedUrl = absoluteNetworkUrl(link.itemId);
  if (!resolvedUrl) failures.push(`${label}: ${link.itemId}の絶対URLを生成不能`);
  const qa = qaByItemId.get(link.itemId);
  if (!qa || qa.state !== "ok") failures.push(`${label}: 未確認network link ${link.itemId}`);
  if (qa && resolvedUrl && qa.url !== resolvedUrl) failures.push(`${label}: ${link.itemId}のQA確認URLがSSOT解決先と不一致 (${qa.url} / ${resolvedUrl})`);
  if (String(link.label ?? "").length < 8) failures.push(`${label}: ${link.itemId}のラベルが具体性不足`);
  if (String(link.description ?? "").length < 20) failures.push(`${label}: ${link.itemId}の説明が20字未満`);
}

function validateNetworkLinks(guide) {
  const links = Array.isArray(guide.networkLinks) ? guide.networkLinks : [];
  const label = `guides/${guide.slug}`;
  if (links.length !== 3) failures.push(`${label}: networkLinksが${links.length}件（3件必須）`);
  if (new Set(links.map((link) => link.itemId)).size !== links.length) failures.push(`${label}: network itemId重複`);
  const siteIds = new Set(links.map((link) => link.siteId));
  for (const siteId of ["learning", "ai", "license"]) if (!siteIds.has(siteId)) failures.push(`${label}: ${siteId}連携なし`);
  for (const link of links) validateResolvedNetworkLink(link, label);
}

for (const link of newsNetworkReferenceByItemId.values()) validateResolvedNetworkLink(link, "news/networkLinks");

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
if (newsPage.includes("export const revalidate = 0")) failures.push("revalidate=0が承認済みニュース詳細の静的出力を無効化する");
if (!newsPage.includes("generateStaticParams()") || !newsPage.includes("buildNewsStaticParams(newsItems)")) failures.push("ニュース詳細の静的パスが公開配列限定ではない");
if (!newsPage.includes("slug === EMPTY_NEWS_ROUTE_SLUG") || !newsPage.includes("notFound()")) failures.push("公開0件用の予約slugを404へ送っていない");
if (!editorialSource.includes("claimIsFresh(claim)")) failures.push("ニュース公開判定が主張の鮮度期限をfail-closedで検査していない");
if (!editorialSource.includes("networkLinksArePublishable(item.networkLinks)")) failures.push("ニュース公開判定がnetwork-map解決結果をfail-closedで検査していない");

for (const directory of ["app", "components", "lib"]) {
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) {
        const source = read(path.relative(root, absolute));
        if (source.includes("guides-expanded")) failures.push(`${path.relative(root, absolute)}: draftガイドJSONを公開面から直接import`);
        if (source.includes("news-expanded")) failures.push(`${path.relative(root, absolute)}: draftニュースJSONを公開面から直接import`);
      }
    }
  };
  walk(path.join(root, directory));
}

const fontPackagePath = require.resolve("@expo-google-fonts/biz-udpgothic/package.json");
const fontPackage = JSON.parse(fs.readFileSync(fontPackagePath, "utf8"));
const fontRoot = path.dirname(fontPackagePath);
if (!String(fontPackage.license).includes("OFL-1.1")) failures.push("OG用BIZ UDPGothicのOFL-1.1ライセンスを確認できない");
if (fontPackage.version !== "0.4.2") failures.push(`OG用フォントpackageのversionが未固定: ${fontPackage.version}`);
const fontArtifacts = [
  { relative: "400Regular/BIZUDPGothic_400Regular.ttf", sha256: "22f41ce68f1ce62477ca4ec1e2c0c400cc545ddff31d713e8edf87808614aeb2" },
  { relative: "700Bold/BIZUDPGothic_700Bold.ttf", sha256: "1a995936e0f9de8a7c142c97cdb679e7087e89c13e663f946cd047f4283cedf8" },
];
for (const fontArtifact of fontArtifacts) {
  const absolute = path.join(fontRoot, fontArtifact.relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`OG用日本語フォントなし: ${fontArtifact.relative}`);
    continue;
  }
  const actualSha = createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
  if (actualSha !== fontArtifact.sha256) failures.push(`OG用フォントのSHA-256不一致: ${fontArtifact.relative}`);
}
for (const requiredCode of ["new Resvg", "fontFiles:", "loadSystemFonts: false", "defaultFontFamily: fontFamily"]) {
  if (!ogGenerator.includes(requiredCode)) failures.push(`OG生成処理がBIZ UDPGothicを固定するResvg設定を欠く: ${requiredCode}`);
}
if (!ogGenerator.includes("layoutOgTitle")) failures.push("OG生成処理が日本語禁則レイアウトを使っていない");
if (!ogGenerator.includes("check-editorial.mjs") || !ogGenerator.includes("--before-og")) failures.push("公開OG生成前に本文と同じfail-closed編集検査を実行していない");
for (const reviewField of ["item.status === \"published\"", "item.publishedAt", "item.reviewedAt", "item.reviewedBy", "item.reviewedByHumanAt"]) {
  if (!ogGenerator.includes(reviewField)) failures.push(`OG公開条件不足: ${reviewField}`);
}

const baseNews = extractArray("const newsItemsData").map((item) => ({
  ...baseNewsFromSource(item),
  digestKind: "base",
  digestSource: item,
}));
const expandedNewsModels = expandedNews.map((item) => ({
  ...item,
  sectionsText: ["whatHappened", "howToRead", "whatNotToConclude", "nextActions", "decisionSupport"].flatMap((key) => item[key] ?? []).join(""),
  uniqueText: ["whatHappened", "howToRead", "whatNotToConclude", "nextActions", "decisionSupport"].flatMap((key) => item[key] ?? []).join(""),
  digestKind: "expanded",
  digestSource: JSON.stringify(item),
}));
const expandedParagraphOwners = new Map();
for (const item of expandedNews) {
  for (const paragraph of ["whatHappened", "howToRead", "whatNotToConclude", "nextActions", "decisionSupport"].flatMap((key) => item[key] ?? [])) {
    const normalized = String(paragraph).replace(/\s+/g, "");
    if (normalized.length < 80) continue;
    const owners = expandedParagraphOwners.get(normalized) ?? [];
    owners.push(item.slug);
    expandedParagraphOwners.set(normalized, owners);
  }
}
for (const owners of expandedParagraphOwners.values()) {
  if (owners.length > 1) failures.push(`ニュース本文の長文段落を使い回し: ${owners.join(", ")}`);
}
const allNews = [...baseNews, ...expandedNewsModels];
if (allNews.length > 0 && newsNetworkResolutionSnapshot.length > 0) {
  const changedNetworkResolution = newsNetworkResolutionSnapshot.map((entry, index) => index === 0
    ? { ...entry, resolvedUrl: `${entry.resolvedUrl ?? "https://invalid.example/"}?review-regression=changed` }
    : entry);
  if (newsContentDigest(allNews[0]) === newsContentDigest(allNews[0], changedNetworkResolution)) {
    failures.push("ニュース審査ハッシュがnetwork-map解決先の変更を検出できない");
  }
  const changedQaResolution = newsNetworkResolutionSnapshot.map((entry, index) => index === 0
    ? { ...entry, qa: { ...(entry.qa ?? {}), state: "changed-for-regression" } }
    : entry);
  if (newsContentDigest(allNews[0]) === newsContentDigest(allNews[0], changedQaResolution)) {
    failures.push("ニュース審査ハッシュがnetwork QA結果の変更を検出できない");
  }
}
const requiredOgText = [
  "NEWS", "GUIDE", "manapick career", "career.manapick.app",
  ...allGuides.flatMap((item) => [item.title, item.category, item.publishedAt, item.createdAt]),
  ...allNews.flatMap((item) => [item.title, item.kind, item.publishedAt, item.createdAt]),
].filter(Boolean).join("");
const requiredOgCodePoints = new Set([...requiredOgText].map((character) => character.codePointAt(0)).filter((codePoint) => !/\s/u.test(String.fromCodePoint(codePoint))));
for (const fontArtifact of fontArtifacts) {
  const absolute = path.join(fontRoot, fontArtifact.relative);
  if (!fs.existsSync(absolute)) continue;
  try {
    const supported = fontCodePoints(absolute);
    const missing = [...requiredOgCodePoints].filter((codePoint) => !supported.has(codePoint));
    if (missing.length) failures.push(`OG用フォントの不足グリフ ${fontArtifact.relative}: ${missing.map((codePoint) => `${String.fromCodePoint(codePoint)}(U+${codePoint.toString(16).toUpperCase()})`).join(", ")}`);
  } catch (error) {
    failures.push(`OG用フォントcmap検査失敗 ${fontArtifact.relative}: ${error.message}`);
  }
}
const newsBySlug = new Map(allNews.map((item) => [item.slug, item]));
const publicationRecords = Array.isArray(newsPublication.records) ? newsPublication.records : [];
const publicationBySlug = new Map(publicationRecords.map((record) => [record.slug, record]));
if (new Set(allNews.map((item) => item.slug)).size !== allNews.length) failures.push("ニュースslug重複");
if (publicationBySlug.size !== publicationRecords.length) failures.push("news-publicationのslug重複");
for (const item of allNews) if (!publicationBySlug.has(item.slug)) failures.push(`news/${item.slug}: 公開ステータスレコードなし`);
for (const record of publicationRecords) {
  const item = newsBySlug.get(record.slug);
  if (!item) {
    failures.push(`news-publication/${record.slug}: 本文のない孤立レコード`);
    continue;
  }
  if (!["draft", "reviewed", "published"].includes(record.status)) failures.push(`news-publication/${record.slug}: status不正 ${record.status}`);
  if (!validDate(record.createdAt)) failures.push(`news-publication/${record.slug}: createdAtが不正`);
  if (record.sourcePublishedAt && !validDate(record.sourcePublishedAt)) failures.push(`news-publication/${record.slug}: sourcePublishedAtが不正`);
  if (!sourceIds.has(record.primarySourceId)) failures.push(`news-publication/${record.slug}: 未登録primarySourceId ${record.primarySourceId}`);
  if (!item.sourceIds.includes(record.primarySourceId)) failures.push(`news-publication/${record.slug}: 記事sourceIdsにprimarySourceIdがない`);
  if (validDate(record.sourcePublishedAt) && validDate(item.checkedAt) && record.sourcePublishedAt > item.checkedAt) failures.push(`news-publication/${record.slug}: 一次資料公表日が確認日より後`);
  if (record.status === "published") {
    if (!validDate(record.sourcePublishedAt)) failures.push(`news-publication/${record.slug}: published条件 sourcePublishedAt なし`);
    for (const fieldName of ["publishedAt", "reviewedAt", "reviewedBy", "reviewedByHumanAt", "reviewEvidence"]) {
      if (!record[fieldName]) failures.push(`news-publication/${record.slug}: published条件 ${fieldName} なし`);
    }
    for (const fieldName of ["publishedAt", "reviewedAt", "reviewedByHumanAt"]) {
      if (record[fieldName] && !validDate(record[fieldName])) failures.push(`news-publication/${record.slug}: ${fieldName}が不正`);
    }
    if (validDate(record.createdAt) && validDate(record.publishedAt) && record.createdAt > record.publishedAt) failures.push(`news-publication/${record.slug}: 作成日がサイト公開日より後`);
    if (validDate(record.reviewedAt) && validDate(record.publishedAt) && record.reviewedAt > record.publishedAt) failures.push(`news-publication/${record.slug}: 編集確認日がサイト公開日より後`);
    if (validDate(record.reviewedByHumanAt) && validDate(record.publishedAt) && record.reviewedByHumanAt > record.publishedAt) failures.push(`news-publication/${record.slug}: 人による確認日がサイト公開日より後`);
    if (record.reviewEvidence) validateGitReviewEvidence(record.reviewEvidence, `news-publication/${record.slug}`, record.reviewedByHumanAt);
    const critical = item.kind === "賃金・労働時間" || item.kind === "雇用統計";
    const freshnessDays = critical ? 45 : 120;
    if (!validDate(item.checkedAt)) {
      failures.push(`news/${item.slug}: published条件 checkedAtが不正`);
    } else if (new Date(`${item.checkedAt}T00:00:00Z`) > today) {
      failures.push(`news/${item.slug}: checkedAtが検査日より未来 (${item.checkedAt})`);
    } else if (freshnessIsExpired(item.checkedAt, freshnessDays)) {
      const message = `news/${item.slug}: 主張の鮮度期限超過 (${item.checkedAt}+${freshnessDays}日)`;
      if (critical) failures.push(message);
      else warnings.push(message);
    }
    const actualDigest = newsContentDigest(item);
    if (!/^[0-9a-f]{64}$/i.test(String(record.contentSha256 ?? ""))) {
      failures.push(`news-publication/${record.slug}: published条件 contentSha256 なし（現在値 ${actualDigest}）`);
    } else if (record.contentSha256 !== actualDigest) {
      failures.push(`news-publication/${record.slug}: 人手確認後に本文・出典・連携実装が変更（記録 ${record.contentSha256} / 現在 ${actualDigest}）`);
    }
  } else {
    if (record.publishedAt !== null) failures.push(`news-publication/${record.slug}: ${record.status}にpublishedAtがある`);
    if (record.status === "draft" && [record.reviewedAt, record.reviewedBy, record.reviewedByHumanAt, record.reviewEvidence].some((value) => value !== null)) failures.push(`news-publication/${record.slug}: draftにレビュー証跡がある`);
    if (record.contentSha256 != null) failures.push(`news-publication/${record.slug}: ${record.status}にcontentSha256がある`);
  }
}
for (const item of allNews) {
  if (item.sectionsText.length < 1000) failures.push(`news/${item.slug}: 本文が${item.sectionsText.length}字で1000字未満`);
  if (expandedNewsModels.includes(item) && item.uniqueText.length < 1000) failures.push(`news/${item.slug}: 記事固有本文が${item.uniqueText.length}字で1000字未満`);
  if (String(item.answer ?? "").length < 50) failures.push(`news/${item.slug}: 要約回答が不足`);
  if (!Array.isArray(item.keyPoints) || item.keyPoints.length < 3) failures.push(`news/${item.slug}: 要点が3件未満`);
  for (const sourceId of item.sourceIds ?? []) if (!sourceIds.has(sourceId)) failures.push(`news/${item.slug}: 未登録sourceId ${sourceId}`);
  try {
    const layout = layoutOgTitle(item.title);
    for (const error of validateOgTitleLayout(item.title, layout.lines)) failures.push(`news/${item.slug}: OG改行 ${error}`);
  } catch (error) {
    failures.push(`news/${item.slug}: ${error.message}`);
  }
}
if (/kind:\s*"(?:機能改善|編集情報|公開情報)"/.test(editorialSource)) failures.push("ニュースにサイト更新情報が混入");

const newsCores = expandedNewsModels.map((item) => ({ slug: item.slug, grams: trigramSet(item.uniqueText) }));
for (let left = 0; left < newsCores.length; left += 1) {
  for (let right = left + 1; right < newsCores.length; right += 1) {
    const similarity = jaccard(newsCores[left].grams, newsCores[right].grams);
    if (similarity >= 0.2) failures.push(`news/${newsCores[left].slug} と ${newsCores[right].slug}: 独自本文類似度 ${(similarity * 100).toFixed(1)}%`);
  }
}

if (!beforeOgGeneration) {
  const expectedPublishedOg = [
    ...publishedGuides.map((guide) => ({ directory: "guide", slug: guide.slug })),
    ...publicationRecords.filter((record) => record.status === "published").map((record) => ({ directory: "news", slug: record.slug })),
  ];
  for (const item of expectedPublishedOg) {
    const image = path.join(root, "public/og/biz-udp-v1", item.directory, `${item.slug}.png`);
    if (!fs.existsSync(image)) {
      failures.push(`${path.relative(root, image)}: 公開記事のOG画像なし`);
      continue;
    }
    const size = readPngSize(image);
    if (!size || size.width !== 1200 || size.height !== 630) failures.push(`${path.relative(root, image)}: OG画像が1200×630 PNGではない`);
    const previousImage = path.join(root, "public/og/jp-v2", item.directory, `${item.slug}.png`);
    if (fs.existsSync(previousImage) && fs.readFileSync(image).equals(fs.readFileSync(previousImage))) {
      failures.push(`${path.relative(root, image)}: 旧Noto生成画像とbyte-identical（BIZ UDPGothicが適用されていない）`);
    }
  }
  for (const guide of draftGuides) {
    const image = path.join(root, "public/og/biz-udp-v1/guide", `${guide.slug}.png`);
    if (fs.existsSync(image)) failures.push(`${path.relative(root, image)}: draftガイドのOG画像が公開ディレクトリへ混入`);
  }
  for (const record of publicationRecords.filter((item) => item.status !== "published")) {
    const image = path.join(root, "public/og/biz-udp-v1/news", `${record.slug}.png`);
    if (fs.existsSync(image)) failures.push(`${path.relative(root, image)}: ${record.status}ニュースのOG画像が公開ディレクトリへ混入`);
  }
  for (const legacyDirectory of ["public/og/guide", "public/og/news", "public/og/jp-v2"]) {
    const absoluteDirectory = path.join(root, legacyDirectory);
    if (fs.existsSync(absoluteDirectory)) {
      failures.push(`${legacyDirectory}: 旧OG公開ディレクトリが残存（BIZ UDPGothic固定の現行パスだけを公開する）`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  if (warnings.length) console.warn(`warnings:\n${warnings.join("\n")}`);
  process.exit(1);
}
if (warnings.length) console.warn(`editorial warnings:\n${warnings.join("\n")}`);
console.log(
  `editorial check: totalGuides=${allGuides.length} publishedGuides=${publishedGuides.length} draftGuides=${draftGuides.length} news=${allNews.length} publishedNews=${publicationRecords.filter((record) => record.status === "published").length}; `
  + `minGuideText=${Math.min(...allGuides.map((guide) => guide.sectionsText.length))} minNewsText=${Math.min(...allNews.map((item) => item.sectionsText.length))} minExpandedNewsUnique=${Math.min(...expandedNewsModels.map((item) => item.uniqueText.length))}; `
  + `claims=${claimRegistry.reduce((sum, record) => sum + record.claims.length, 0)} network=SSOT/QA-ok maxGuideSimilarity=${(maxGuideSimilarity.value * 100).toFixed(2)}% (${maxGuideSimilarity.pair}) OG=BIZ-UDPGothic/Segmenter/kinsoku`,
);
