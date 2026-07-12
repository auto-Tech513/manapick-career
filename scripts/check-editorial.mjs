import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = fs.readFileSync(path.join(root, "content/editorial.ts"), "utf8");
const registry = JSON.parse(fs.readFileSync(path.join(root, "content/source-registry.json"), "utf8"));
const sourceIds = new Set(registry.map((source) => source.sourceId));
const failures = [];

const arrays = [...file.matchAll(/(?:export const guides|const newsItemsData):[^=]+?= \[([\s\S]*?)\n\];/g)].map((match) => [match[0].startsWith("export const guides") ? "guides" : "newsItems", match[1]]);
for (const [collection, source] of arrays) {
  const items = source.split(/\n  \{\n    slug:/).slice(1).map((chunk) => `slug:${chunk}`);
  for (const item of items) {
    const slug = item.match(/slug:\s*"([^"]+)"/)?.[1] ?? "unknown";
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

if (/kind:\s*"(?:機能改善|編集情報|公開情報)"/.test(file)) failures.push("ニュースにサイト更新情報が混入");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("editorial check: guides/news are long-form, sourced, and TOC-ready");
