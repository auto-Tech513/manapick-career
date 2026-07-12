import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("content/pr-links.json", "utf8"));
const editorial = fs.readFileSync("content/editorial.ts", "utf8");
const policy = fs.readFileSync("content/editorial-policy.json", "utf8");
const failures = [];

if (/\b(?:EPC|報酬額|コミッション|承認率)\b/i.test(editorial)) failures.push("編集本文に収益指標が混入");
if (!policy.includes("報酬額、承認状況、EPCを掲載順に使わない")) failures.push("掲載順位の独立方針が不足");
for (const item of data.items ?? []) {
  if (!item.offerId || !item.provider || !item.url || !item.verifiedAt) failures.push(`${item.offerId ?? "unknown"}: 必須項目不足`);
  if (!item.disclosure?.includes("PR")) failures.push(`${item.offerId}: PR開示不足`);
  if (!Array.isArray(item.placements) || !item.placements.length) failures.push(`${item.offerId}: 配置範囲なし`);
  if (/\b(?:epc|commission|reward|rank)\b/i.test(JSON.stringify(item))) failures.push(`${item.offerId}: 順位付けに不要な収益指標を保存`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("monetization check: PR data is separate, disclosed, and placement-scoped");
