// 企業例の出典URL（content/occupation-employers.json）の生存確認。
// ネットワークに依存するため build ゲートには入れず、手動/定期実行専用。
// 使い方: node scripts/audit-employer-links.mjs [--concurrency 6] [--stale-days 180]
// 終了コード: 死活NGが1件でもあれば 1。
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 ? Number(argv[i + 1]) : fallback;
};
const concurrency = opt("--concurrency", 6);
const staleDays = opt("--stale-days", 180);

const data = JSON.parse(await fs.readFile(path.join(root, "content/occupation-employers.json"), "utf8"));
const entries = [];
for (const item of data.items ?? []) {
  for (const employer of item.employers ?? []) {
    if (employer.source?.url) entries.push({ catalogId: item.catalogId, name: employer.name, url: employer.source.url, checkedAt: employer.source.checkedAt });
  }
}
const byUrl = new Map();
for (const entry of entries) {
  if (!byUrl.has(entry.url)) byUrl.set(entry.url, []);
  byUrl.get(entry.url).push(entry);
}
const urls = [...byUrl.keys()];
console.log(`employer source URLs: ${entries.length} entries / ${urls.length} unique URLs`);

const today = new Date();
const stale = entries.filter((e) => e.checkedAt && (today - new Date(e.checkedAt)) / 86400000 > staleDays);
if (stale.length) {
  console.log(`\ncheckedAt older than ${staleDays} days: ${stale.length}`);
  for (const e of stale.slice(0, 20)) console.log(`  stale [${e.catalogId}] ${e.name} checkedAt=${e.checkedAt}`);
}

const failures = [];
let done = 0;
async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; manapick-career-link-audit/1.0)" },
    });
    await res.arrayBuffer().catch(() => undefined);
    return res.status;
  } catch (error) {
    return `error:${error.name === "AbortError" ? "timeout" : error.message}`;
  } finally {
    clearTimeout(timer);
  }
}
const queue = [...urls];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const status = await check(url);
    done += 1;
    if (typeof status !== "number" || status >= 400) {
      failures.push({ url, status, users: byUrl.get(url).map((e) => `[${e.catalogId}] ${e.name}`) });
    }
    if (done % 100 === 0) console.log(`  ... ${done}/${urls.length}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));

console.log(`\nchecked ${urls.length} URLs; failures: ${failures.length}`);
for (const f of failures) {
  console.log(`  NG status=${f.status} ${f.url}`);
  for (const u of f.users) console.log(`      used by ${u}`);
}
process.exit(failures.length ? 1 : 0);
