import fs from "node:fs/promises";
import {loadJobs} from "./load-jobs.mjs";

const {jobs}=await loadJobs();
const sources=JSON.parse(await fs.readFile(new URL("../content/source-registry.json",import.meta.url),"utf8"));
const network=JSON.parse(await fs.readFile(new URL("../content/network-map.json",import.meta.url),"utf8"));
const pr=JSON.parse(await fs.readFile(new URL("../content/pr-links.json",import.meta.url),"utf8"));
const errors=[];const warnings=[];const slugs=new Set();const sourceIds=new Set(sources.map(x=>x.sourceId));const networkIds=new Set(Object.keys(network.items));
for(const job of jobs){
  if(slugs.has(job.slug))errors.push(`duplicate slug: ${job.slug}`);slugs.add(job.slug);
  for(const key of ["slug","name","category","status","conclusion","work","possibilities","cautions","tasks","skills","learningSteps","qualifications","ai","videos","learningTime","sourceIds","checkedAt","editorNote","claims"]){if(job[key]===undefined||job[key]===null||job[key]==="")errors.push(`${job.slug}: missing ${key}`)}
  if(!["draft","reviewed","published"].includes(job.status))errors.push(`${job.slug}: invalid status`);
  if(job.status==="published"){
    const originalBody=[...job.work,...job.possibilities,...job.cautions,...job.tasks,...job.learningSteps].join("");
    if(originalBody.length<180)errors.push(`${job.slug}: original body too short`);
    if(!job.editorReviewed)errors.push(`${job.slug}: editor review missing`);
    if(!job.videos.length)errors.push(`${job.slug}: related video missing`);
    if(!job.ai.length)errors.push(`${job.slug}: related AI missing`);
    if(!job.sourceIds.length||!job.claims.length)errors.push(`${job.slug}: official sources/claims missing`);
  }
  for(const id of job.sourceIds)if(!sourceIds.has(id))errors.push(`${job.slug}: unknown source ${id}`);
  for(const claim of job.claims){if(!claim.lastCheckedAt||!claim.freshnessDays)errors.push(`${job.slug}/${claim.id}: freshness missing`);for(const id of claim.sourceIds)if(!sourceIds.has(id))errors.push(`${job.slug}/${claim.id}: unknown source ${id}`)}
  for(const item of [...job.videos,...job.ai,...job.qualifications])if(!networkIds.has(item.networkId))errors.push(`${job.slug}: unknown network item ${item.networkId}`);
  const text=JSON.stringify(job);for(const phrase of ["必ず転職","最短で稼げる","適職診断","採用を保証","就職率100%"]){if(text.includes(phrase))errors.push(`${job.slug}: prohibited phrase ${phrase}`)}
}
if(pr.enabled!==false)warnings.push("PR feature flag is enabled");
if(JSON.stringify(jobs).includes("EPC")||JSON.stringify(jobs).includes("報酬額"))errors.push("editorial jobs contain monetization ranking data");
console.log(`content: ${jobs.length} jobs / ${jobs.filter(x=>x.status==="published").length} published / ${sources.length} sources`);warnings.forEach(x=>console.warn(`WARN ${x}`));if(errors.length){errors.forEach(x=>console.error(`ERROR ${x}`));process.exit(1)}
