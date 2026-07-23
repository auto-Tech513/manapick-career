import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sites = JSON.parse(fs.readFileSync(path.join(root, "content/competitive-landscape.json"), "utf8"));
const failures = [];
const today = new Date(new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date()) + "T00:00:00+09:00");
const maxAgeDays = 90;
if (sites.length !== 100) failures.push(`競合・参照サイト登録数が${sites.length}件（100件必須）`);
const ids = new Set();
const urls = new Set();
for (const site of sites) {
  if (!/^[a-z0-9-]+$/.test(site.id ?? "")) failures.push(`${site.name ?? "unknown"}: id形式不正`);
  if (ids.has(site.id)) failures.push(`${site.id}: id重複`);
  ids.add(site.id);
  if (!/^https:\/\//.test(site.url ?? "")) failures.push(`${site.id}: HTTPS URLではない`);
  if (urls.has(site.url)) failures.push(`${site.id}: URL重複`);
  urls.add(site.url);
  if (!site.category || !["deep", "surface"].includes(site.reviewDepth)) failures.push(`${site.id}: 分類または調査深度が不足`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(site.checkedAt ?? "")) {
    failures.push(`${site.id}: 確認日形式不正`);
  } else {
    const checkedAt = new Date(`${site.checkedAt}T00:00:00+09:00`);
    const ageDays = Math.floor((today.getTime() - checkedAt.getTime()) / 86_400_000);
    if (Number.isNaN(checkedAt.getTime())) failures.push(`${site.id}: 確認日が日付ではない`);
    else if (ageDays < 0) failures.push(`${site.id}: 確認日が未来 (${site.checkedAt})`);
    else if (ageDays > maxAgeDays) failures.push(`${site.id}: 確認から${ageDays}日経過（上限${maxAgeDays}日）`);
  }
}
const deep = sites.filter((site) => site.reviewDepth === "deep").length;
if (deep < 20) failures.push(`深掘り確認が${deep}件（20件以上必須）`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`competitive registry check: sites=${sites.length} deep=${deep} surface=${sites.length - deep}`);

if (process.argv.includes("--network")) {
  const results = { ok: [], broken: [], botRestricted: [], unconfirmed: [] };
  let cursor = 0;
  const workers = Array.from({ length: 5 }, async () => {
    while (cursor < sites.length) {
      const site = sites[cursor++];
      try {
        const response = await fetch(site.url, {
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
          headers: {
            "User-Agent": "manapick-career-link-check/1.0 (+https://career.manapick.app/about-method/)",
            Range: "bytes=0-1023",
          },
        });
        await response.body?.cancel();
        const entry = { id: site.id, status: response.status, url: site.url };
        if (response.status >= 200 && response.status < 400) results.ok.push(entry);
        else if ([401, 403, 429].includes(response.status)) results.botRestricted.push(entry);
        else if ([404, 410].includes(response.status)) results.broken.push(entry);
        else results.unconfirmed.push(entry);
      } catch (error) {
        results.unconfirmed.push({ id: site.id, status: "network-error", url: site.url, note: error instanceof Error ? error.name : "unknown" });
      }
    }
  });
  await Promise.all(workers);
  console.log(`competitive network: ${results.ok.length} ok / ${results.broken.length} broken / ${results.botRestricted.length} bot-restricted / ${results.unconfirmed.length} unconfirmed`);
  for (const item of [...results.broken, ...results.unconfirmed]) console.log(`${item.status}\t${item.id}\t${item.url}`);
  if (results.broken.length) process.exitCode = 1;
}
