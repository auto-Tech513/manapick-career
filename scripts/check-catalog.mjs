import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await fs.readFile(path.join(root, "content/job-catalog.json"), "utf8"));
const jobsText = await fs.readFile(path.join(root, "content/jobs.ts"), "utf8");
const rankingText = await fs.readFile(path.join(root, "content/popularity-ranking.ts"), "utf8");
const failures = [];

if (catalog.occupations.length < 500) failures.push(`catalog has only ${catalog.occupations.length} occupations`);
if (catalog.categories.length !== 15) failures.push(`catalog has ${catalog.categories.length} categories; expected 15`);
if (new Set(catalog.occupations.map((item) => item.catalogId)).size !== catalog.occupations.length) failures.push("duplicate catalogId");
if (new Set(catalog.occupations.map((item) => item.name)).size !== catalog.occupations.length) failures.push("duplicate occupation name");
const categoryKeys = new Set(catalog.categories.map((item) => item.key));
for (const occupation of catalog.occupations) {
  if (!categoryKeys.has(occupation.categoryKey)) failures.push(`${occupation.name}: unknown category ${occupation.categoryKey}`);
  if (!/^\d{2}_/.test(occupation.classificationCode)) failures.push(`${occupation.name}: invalid classification ${occupation.classificationCode}`);
  if ("description" in occupation || "body" in occupation || "salary" in occupation) failures.push(`${occupation.name}: catalog contains prohibited generated detail`);
}
if (!catalog.source?.sourceId || !catalog.source?.importedAt || !catalog.source?.usage) failures.push("source attribution is incomplete");
if (jobsText.includes('name: "AI・DX推進担当"')) failures.push("obsolete AI・DX推進担当 remains published");
if (!jobsText.includes('name: "ITコンサルタント"')) failures.push("ITコンサルタント detail is missing");
if ((rankingText.match(/rank:\s*\d+/g) ?? []).length !== 12) failures.push("ranking must contain exactly 12 source-confirmed entries");
if (!rankingText.includes("アクセス数は関心の大きさ")) failures.push("ranking limitation is missing");

if (failures.length) {
  failures.forEach((failure) => console.error(`ERROR ${failure}`));
  process.exit(1);
}
console.log(`catalog check: ${catalog.occupations.length} occupations / ${catalog.categories.length} categories / no generated detail bodies`);
