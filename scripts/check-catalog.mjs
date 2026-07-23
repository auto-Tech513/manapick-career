import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await fs.readFile(path.join(root, "content/job-catalog.json"), "utf8"));
const publication = JSON.parse(await fs.readFile(path.join(root, "content/occupation-publication.json"), "utf8"));
const sourceRegistry = JSON.parse(await fs.readFile(path.join(root, "content/source-registry.json"), "utf8"));
const jobsText = await fs.readFile(path.join(root, "content/jobs.ts"), "utf8");
const rankingText = await fs.readFile(path.join(root, "content/popularity-ranking.ts"), "utf8");
const catalogModuleText = await fs.readFile(path.join(root, "content/catalog.ts"), "utf8");
const catalogComponentText = await fs.readFile(path.join(root, "components/OccupationCatalog.tsx"), "utf8");
const occupationPageText = await fs.readFile(path.join(root, "app/occupation/[id]/page.tsx"), "utf8").catch(() => null);
const sitemapText = await fs.readFile(path.join(root, "app/sitemap.ts"), "utf8");
const llmsText = await fs.readFile(path.join(root, "app/llms.txt/route.ts"), "utf8");
const failures = [];
const statuses = new Set(["draft", "reviewed", "published"]);
const sourceById = new Map(sourceRegistry.map((source) => [source.sourceId, source]));
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const hasStrings = (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim());
const charLength = (value) => Array.from(typeof value === "string" ? value.replace(/\s+/g, "") : "").length;
const validateGitReviewEvidence = (value, catalogId, reviewedAt) => {
  if (!/^git:[0-9a-f]{7,40}$/i.test(String(value))) {
    failures.push(`${catalogId}: reviewEvidence must be git:<7-40 hex>`);
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
    failures.push(`${catalogId}: reviewEvidence commit is absent from the current Git history (${value})`);
    return;
  }
  try {
    const commitDate = execFileSync("git", ["show", "-s", "--format=%cs", fullRevision], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    if (isDate(reviewedAt) && isDate(commitDate) && commitDate > reviewedAt) failures.push(`${catalogId}: reviewEvidence commit date is after human review (${commitDate} > ${reviewedAt})`);
  } catch {
    failures.push(`${catalogId}: reviewEvidence commit date cannot be inspected (${value})`);
  }
};

if (catalog.occupations.length < 500) failures.push(`catalog has only ${catalog.occupations.length} occupations`);
if (catalog.categories.length !== 15) failures.push(`catalog has ${catalog.categories.length} categories; expected 15`);
if (new Set(catalog.occupations.map((item) => item.catalogId)).size !== catalog.occupations.length) failures.push("duplicate catalogId");
if (new Set(catalog.occupations.map((item) => item.name)).size !== catalog.occupations.length) failures.push("duplicate occupation name");
const categoryKeys = new Set(catalog.categories.map((item) => item.key));
for (const occupation of catalog.occupations) {
  if (!categoryKeys.has(occupation.categoryKey)) failures.push(`${occupation.name}: unknown category ${occupation.categoryKey}`);
  if (!/^\d{2}_/.test(occupation.classificationCode)) failures.push(`${occupation.name}: invalid classification ${occupation.classificationCode}`);
  for (const key of ["summary", "work", "entry", "conditions", "organizations", "qualifications", "updatedYears"]) {
    if (occupation[key] === undefined || occupation[key] === null || occupation[key] === "") failures.push(`${occupation.name}: missing source detail ${key}`);
  }
  if (occupation.summary.length < 12 || occupation.work.length < 40 || occupation.entry.length < 40 || occupation.conditions.length < 40) failures.push(`${occupation.name}: source detail too short`);
  if ("salary" in occupation || "ranking" in occupation || "suitabilityScore" in occupation) failures.push(`${occupation.name}: catalog contains prohibited evaluation data`);
}
if (!catalog.source?.sourceId || !catalog.source?.importedAt || !catalog.source?.datasetUpdatedAt || !catalog.source?.usage) failures.push("source attribution is incomplete");

if (publication.schemaVersion !== 1) failures.push("occupation publication registry schemaVersion must be 1");
if (publication.defaultStatus !== "draft" || publication.policy?.unlistedCatalogStatus !== "draft") failures.push("unlisted occupations must fail closed as draft");
if (!Array.isArray(publication.records)) failures.push("occupation publication records must be an array");
const publicationRecords = Array.isArray(publication.records) ? publication.records : [];
const publicationIds = new Set();
const catalogIds = new Set(catalog.occupations.map((item) => item.catalogId));
let publishedCount = 0;
for (const record of publicationRecords) {
  if (!catalogIds.has(record.catalogId)) failures.push(`occupation publication has unknown catalogId ${record.catalogId}`);
  if (publicationIds.has(record.catalogId)) failures.push(`duplicate occupation publication record ${record.catalogId}`);
  publicationIds.add(record.catalogId);
  if (!statuses.has(record.status)) failures.push(`${record.catalogId}: invalid occupation status ${record.status}`);
  if (record.status !== "published" && record.publishedAt) failures.push(`${record.catalogId}: ${record.status} occupation must not have publishedAt`);
  if (record.status === "published") {
    publishedCount += 1;
    if (charLength(record.uniqueEditorialBody) < 1000) failures.push(`${record.catalogId}: published occupation needs at least 1,000 non-whitespace characters of unique editorial body`);
    if (!hasStrings(record.officialSourceIds)) failures.push(`${record.catalogId}: published occupation has no officialSourceIds`);
    for (const sourceId of record.officialSourceIds ?? []) {
      const source = sourceById.get(sourceId);
      if (!source) failures.push(`${record.catalogId}: unknown sourceId ${sourceId}`);
      else if (source.isPrimary !== true) failures.push(`${record.catalogId}: source ${sourceId} is not primary`);
    }
    if (!isDate(record.checkedAt)) failures.push(`${record.catalogId}: invalid checkedAt`);
    if (!hasStrings(record.relatedVideoIds)) failures.push(`${record.catalogId}: relatedVideoIds are required`);
    if (!hasStrings(record.relatedQualificationIds)) failures.push(`${record.catalogId}: relatedQualificationIds are required`);
    if (!hasStrings(record.relatedAiIds)) failures.push(`${record.catalogId}: relatedAiIds are required`);
    if (!record.author?.trim() || !record.editor?.trim() || record.editorReviewed !== true) failures.push(`${record.catalogId}: author/editor human review is incomplete`);
    for (const key of ["reviewedAt", "reviewedByHumanAt", "publishedAt"]) if (!isDate(record[key])) failures.push(`${record.catalogId}: invalid ${key}`);
    if (!record.reviewEvidence?.trim()) failures.push(`${record.catalogId}: reviewEvidence is required`);
    else validateGitReviewEvidence(record.reviewEvidence, record.catalogId, record.reviewedByHumanAt);
    if (isDate(record.checkedAt) && isDate(record.reviewedByHumanAt) && record.checkedAt > record.reviewedByHumanAt) failures.push(`${record.catalogId}: checkedAt is after human review`);
    if (isDate(record.reviewedByHumanAt) && isDate(record.publishedAt) && record.reviewedByHumanAt > record.publishedAt) failures.push(`${record.catalogId}: human review is after publication`);
  }
}
const effectiveDraftCount = catalog.occupations.filter((item) => !publicationIds.has(item.catalogId)).length + publicationRecords.filter((record) => record.status === "draft").length;
if (effectiveDraftCount + publicationRecords.filter((record) => record.status === "reviewed").length + publishedCount !== catalog.occupations.length) failures.push("occupation publication registry does not resolve exactly one status for every catalog entry");

if (!catalogModuleText.includes("publishedOccupationCatalog") || !catalogModuleText.includes("uniqueEditorialBody") || !catalogModuleText.includes("record.status === \"published\"")) failures.push("content/catalog.ts is missing the fail-closed publication gate");
if (publishedCount === 0 && occupationPageText !== null) failures.push("occupation route must stay absent while no occupation publication record is fully published (empty generateStaticParams is incompatible with static export)");
if (publishedCount > 0 && occupationPageText === null) failures.push("published occupation records require a gated app/occupation/[id]/page.tsx route");
if (occupationPageText && (!occupationPageText.includes("publishedOccupationCatalog.map") || occupationPageText.includes("occupationCatalog.map((occupation) => ({ id:"))) failures.push("occupation static params must use only publishedOccupationCatalog");
if (occupationPageText && (!occupationPageText.includes("publishedCatalogOccupation(id)") || !occupationPageText.includes("publishedOccupationRecord(id)"))) failures.push("occupation detail lookup must require a complete published record");
if (!sitemapText.includes("publishedOccupationCatalog.map") || sitemapText.includes("...occupationCatalog.map")) failures.push("sitemap must exclude unreviewed occupation catalog entries");
if (catalogComponentText.includes("href={`/occupation/${occupation.catalogId}/`}")) failures.push("directory cards must not link unreviewed entries to /occupation routes");
if (!catalogComponentText.includes("occupationJobTagUrl(occupation.recordNumber)") || !catalogComponentText.includes("公式job tagで仕事内容を確認")) failures.push("directory cards need a clear official job tag fallback");
if (llmsText.includes("個別詳細は /occupation/{id}/") || llmsText.includes("職業名・別名・分類・仕事内容・就くには・労働条件")) failures.push("llms.txt overstates unreviewed occupation detail coverage");
if (jobsText.includes('name: "AI・DX推進担当"')) failures.push("obsolete AI・DX推進担当 remains published");
if (!jobsText.includes('name: "ITコンサルタント"')) failures.push("ITコンサルタント detail is missing");
if ((rankingText.match(/rank:\s*\d+/g) ?? []).length !== 12) failures.push("ranking must contain exactly 12 source-confirmed entries");
if (!rankingText.includes("アクセス数は関心の大きさ")) failures.push("ranking limitation is missing");

if (failures.length) {
  failures.forEach((failure) => console.error(`ERROR ${failure}`));
  process.exit(1);
}
console.log(`catalog check: ${catalog.occupations.length} directory names / ${catalog.categories.length} categories / ${publishedCount} published occupation routes / ${effectiveDraftCount} effective drafts; fail-closed registry and official fallbacks complete`);
