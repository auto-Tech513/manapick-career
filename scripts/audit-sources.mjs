import fs from "node:fs/promises";import {loadJobs} from "./load-jobs.mjs";
const {jobs}=await loadJobs();const sources=JSON.parse(await fs.readFile(new URL("../content/source-registry.json",import.meta.url),"utf8"));const today=new Date();const errors=[];const warnings=[];
for(const source of sources){for(const key of ["sourceId","provider","url","isPrimary","claims","checkedAt","updateFrequency","republication","notes"]){if(source[key]===undefined||source[key]===null||source[key]==="")errors.push(`${source.sourceId||"unknown"}: missing ${key}`)}if(!/^https:\/\//.test(source.url))errors.push(`${source.sourceId}: non-HTTPS source`)}
for(const job of jobs)for(const claim of job.claims){const age=Math.floor((today-new Date(`${claim.lastCheckedAt}T00:00:00+09:00`))/86400000);if(age>claim.freshnessDays){const message=`${job.slug}/${claim.id}: ${age}d old (limit ${claim.freshnessDays}d)`;(claim.critical?errors:warnings).push(message)}}
warnings.forEach(x=>console.warn(`WARN ${x}`));if(errors.length){errors.forEach(x=>console.error(`ERROR ${x}`));process.exit(1)}console.log(`sources: ${sources.length} registered; freshness within limits`);

if (process.argv.includes("--network")) {
  const results = { ok: [], broken: [], botRestricted: [], unconfirmed: [] };
  let cursor = 0;
  const workers = Array.from({ length: 5 }, async () => {
    while (cursor < sources.length) {
      const source = sources[cursor++];
      try {
        const response = await fetch(source.url, {
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
          headers: {
            "User-Agent": "manapick-career-source-check/1.0 (+https://career.manapick.app/about-method/)",
            Range: "bytes=0-1023",
          },
        });
        await response.body?.cancel();
        const entry = { id: source.sourceId, status: response.status, url: source.url };
        if (response.status >= 200 && response.status < 400) results.ok.push(entry);
        else if ([401, 403, 429].includes(response.status)) results.botRestricted.push(entry);
        else if ([404, 410].includes(response.status)) results.broken.push(entry);
        else results.unconfirmed.push(entry);
      } catch (error) {
        results.unconfirmed.push({ id: source.sourceId, status: "network-error", url: source.url, note: error instanceof Error ? error.name : "unknown" });
      }
    }
  });
  await Promise.all(workers);
  console.log(`source network: ${results.ok.length} ok / ${results.broken.length} broken / ${results.botRestricted.length} bot-restricted / ${results.unconfirmed.length} unconfirmed`);
  for (const item of [...results.broken, ...results.unconfirmed]) console.log(`${item.status}\t${item.id}\t${item.url}`);
  if (results.broken.length) process.exitCode = 1;
}
