import fs from "node:fs/promises";

const backlog = JSON.parse(await fs.readFile(new URL("../content/editorial-backlog.json", import.meta.url), "utf8"));
const editorial = await fs.readFile(new URL("../content/editorial.ts", import.meta.url), "utf8");
const failures = [];
if (backlog.news.length !== 40) failures.push(`news backlog=${backlog.news.length}`);
if (backlog.guides.length !== 40) failures.push(`guide backlog=${backlog.guides.length}`);
if (backlog.policy.status !== "draft" || backlog.policy.minimumCharacters < 1000) failures.push("draft quality gate missing");
for (const item of [...backlog.news, ...backlog.guides]) {
  if (!item.id || !item.title) failures.push("backlog item missing id/title");
  if (editorial.includes(`slug: "${item.id}"`)) failures.push(`${item.id} was published without review promotion`);
}
if (failures.length) { failures.forEach((item) => console.error(`ERROR ${item}`)); process.exit(1); }
console.log("editorial backlog: 40 news / 40 guides remain draft and excluded from public routes");
