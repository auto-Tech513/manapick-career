import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf());

const batch = readJson("content/news-review-batch.json");
const publication = readJson("content/news-publication.json");
const expanded = readJson("content/news-expanded.json");
const sources = readJson("content/source-registry.json");
const editorialSource = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");

const failures = [];
const records = Array.isArray(publication.records) ? publication.records : [];
const recordBySlug = new Map(records.map((record) => [record.slug, record]));
const expandedBySlug = new Map(expanded.map((item) => [item.slug, item]));
const sourceById = new Map(sources.map((source) => [source.sourceId, source]));
const slugs = Array.isArray(batch.slugs) ? batch.slugs : [];
const excluded = Array.isArray(batch.excluded) ? batch.excluded : [];
const selectedSlugSet = new Set(slugs);
const excludedSlugSet = new Set(excluded.map((item) => item.slug));
const batchSlugSet = new Set([...selectedSlugSet, ...excludedSlugSet]);

if (!validDate(batch.preparedAt)) failures.push("news review batch: preparedAtが不正");
const validBatchStatuses = new Set(["awaiting-human-review", "approved-for-publication", "published"]);
if (!validBatchStatuses.has(batch.status)) failures.push(`news review batch: statusが不正 ${batch.status}`);
const hasHumanApproval = batch.status !== "awaiting-human-review";
if (hasHumanApproval) {
  if (!validDate(batch.approvedAt)) failures.push("news review batch: approvedAtが不正");
  if (typeof batch.approvedBy !== "string" || !batch.approvedBy.trim()) failures.push("news review batch: approvedByが不足");
  if (typeof batch.authorizationNote !== "string" || !batch.authorizationNote.trim()) failures.push("news review batch: 公開許可の証跡が不足");
}
if (!Number.isInteger(batch.targetCount) || batch.targetCount <= 0) failures.push("news review batch: targetCountが不正");
if (slugs.length !== batch.targetCount) failures.push(`news review batch: ${slugs.length}件でtargetCount ${batch.targetCount}件と不一致`);
if (new Set(slugs).size !== slugs.length) failures.push("news review batch: slug重複");
if (excludedSlugSet.size !== excluded.length) failures.push("news review batch: excludedのslug重複");
if (excluded.some((item) => !item.slug || !item.reason)) failures.push("news review batch: excludedの理由不足");
if (excluded.some((item) => selectedSlugSet.has(item.slug))) failures.push("news review batch: 選定slugがexcludedにも存在");
if (batchSlugSet.size !== records.length) {
  failures.push(`news review batch: 選定${slugs.length}件＋除外${excluded.length}件が公開台帳${records.length}件と不一致`);
}
for (const record of records) {
  if (!batchSlugSet.has(record.slug)) failures.push(`news review batch: 未分類の公開台帳slug ${record.slug}`);
}
if (!Array.isArray(batch.selectionPolicy) || batch.selectionPolicy.length < 5) failures.push("news review batch: 選定基準不足");

function baseArticleField(slug, field) {
  const anchor = `slug: "${slug}"`;
  const start = editorialSource.indexOf(anchor);
  if (start < 0) return null;
  const block = editorialSource.slice(start, start + 5000);
  return block.match(new RegExp(`${field}:\\s*"([^"]+)"`))?.[1] ?? null;
}

const rows = [];
for (const slug of slugs) {
  const record = recordBySlug.get(slug);
  if (!record) {
    failures.push(`news review batch/${slug}: 公開状態レコードなし`);
    continue;
  }
  const expandedItem = expandedBySlug.get(slug);
  const title = expandedItem?.title ?? baseArticleField(slug, "title");
  const checkedAt = expandedItem?.checkedAt ?? baseArticleField(slug, "checkedAt");
  const source = sourceById.get(record.primarySourceId);
  if (!title) failures.push(`news review batch/${slug}: 本文データなし`);
  if (!validDate(record.sourcePublishedAt)) failures.push(`news review batch/${slug}: 一次資料公表日なし`);
  if (!validDate(checkedAt)) failures.push(`news review batch/${slug}: 確認日なし`);
  if (validDate(record.sourcePublishedAt) && validDate(checkedAt) && record.sourcePublishedAt > checkedAt) {
    failures.push(`news review batch/${slug}: 確認日が一次資料公表日より前`);
  }
  if (!source) failures.push(`news review batch/${slug}: primarySourceId未登録 ${record.primarySourceId}`);
  if (source && source.isPrimary !== true) failures.push(`news review batch/${slug}: primarySourceIdが一次情報ではない`);
  if (source && (!validDate(source.checkedAt) || source.checkedAt > batch.preparedAt)) {
    failures.push(`news review batch/${slug}: 出典レジストリ確認日が不正`);
  }
  if (batch.status === "awaiting-human-review" && record.status === "published") {
    failures.push(`news review batch/${slug}: 公開済み記事を未承認バッチへ混入`);
  }
  if (batch.status === "published" && record.status !== "published") {
    failures.push(`news review batch/${slug}: 公開完了バッチに${record.status}記事が残存`);
  }
  rows.push({
    slug,
    title,
    sourcePublishedAt: record.sourcePublishedAt,
    checkedAt,
    provider: source?.provider,
    url: source?.url,
    status: record.status,
  });
}

for (const item of excluded) {
  const record = recordBySlug.get(item.slug);
  if (!record) {
    failures.push(`news review batch excluded/${item.slug}: 公開状態レコードなし`);
    continue;
  }
  if (record.status !== "draft") failures.push(`news review batch excluded/${item.slug}: 除外記事が${record.status}`);
  for (const field of ["publishedAt", "reviewedAt", "reviewedBy", "reviewedByHumanAt", "reviewEvidence", "contentSha256"]) {
    if (record[field] != null) failures.push(`news review batch excluded/${item.slug}: ${field}を保持している`);
  }
}

if (batch.status === "published") {
  const publishedRecords = records.filter((record) => record.status === "published");
  const draftRecords = records.filter((record) => record.status === "draft");
  if (publishedRecords.length !== batch.targetCount) {
    failures.push(`news review batch: published ${publishedRecords.length}件でtargetCount ${batch.targetCount}件と不一致`);
  }
  if (draftRecords.length !== excluded.length) {
    failures.push(`news review batch: draft ${draftRecords.length}件でexcluded ${excluded.length}件と不一致`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

if (process.argv.includes("--list")) {
  for (const [index, row] of rows.entries()) {
    console.log(`${index + 1}. ${row.title}`);
    console.log(`   ${row.sourcePublishedAt} / ${row.provider} / ${row.url}`);
    console.log(`   slug=${row.slug} checkedAt=${row.checkedAt} status=${row.status}`);
  }
}

console.log(
  `news review batch check: batch=${batch.batchId} candidates=${rows.length} `
  + `status=${batch.status} published=${rows.filter((row) => row.status === "published").length} `
  + `humanApproval=${hasHumanApproval ? "recorded" : "pending"}`,
);
