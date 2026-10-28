import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadJobs } from "./load-jobs.mjs";
import { resolveContentCheckDate } from "../lib/content-check-date.mjs";
const {jobs}=await loadJobs();
const sources=JSON.parse(await fs.readFile(new URL("../content/source-registry.json",import.meta.url),"utf8"));
const comparisons=JSON.parse(await fs.readFile(new URL("../content/claim-verification.json",import.meta.url),"utf8"));
const today=resolveContentCheckDate(process.env.CONTENT_CHECK_DATE);
const errors=[]; const warnings=[];
for(const source of sources){
  for(const key of ["sourceId","provider","url","isPrimary","claims","checkedAt","updateFrequency","republication","notes"]){if(source[key]===undefined||source[key]===null||source[key]==="")errors.push(`${source.sourceId||"unknown"}: missing ${key}`)}
  if(!/^https:\/\//.test(source.url))errors.push(`${source.sourceId}: non-HTTPS source`);
}
for(const job of jobs)for(const claim of job.claims){
  const checked=resolveContentCheckDate(claim.lastCheckedAt);
  const age=Math.floor((today-checked)/86400000);
  if(Number.isNaN(checked.valueOf())||Number.isNaN(today.valueOf())||age<0)errors.push(`${job.slug}/${claim.id}: invalid or future check date`);
  if(claim.verificationId){
    const evidence=comparisons.find(item=>item.id===claim.verificationId);
    const digest=createHash("sha256").update(claim.text).digest("hex");
    if(!evidence||evidence.careerSlug!==job.slug||evidence.claimId!==claim.id||evidence.claimSha256!==digest||evidence.verifiedAt!==claim.lastCheckedAt||evidence.humanReview!==false||evidence.method!=="AI-primary-source-comparison"||!evidence.sources.length||evidence.sources.some(source=>!source.url.startsWith("https://")))errors.push(`${job.slug}/${claim.id}: verification evidence mismatch`);
  }
  if(age>claim.freshnessDays){const message=`${job.slug}/${claim.id}: ${age}d old (limit ${claim.freshnessDays}d)`;(claim.critical?errors:warnings).push(message)}
}
warnings.forEach(x=>console.warn(`WARN ${x}`));
if(errors.length){errors.forEach(x=>console.error(`ERROR ${x}`));process.exit(1)}
console.log(`sources: ${sources.length} registered; named claim evidence and freshness checks passed`);

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
