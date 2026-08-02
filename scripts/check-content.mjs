import fs from "node:fs/promises";
import {loadJobs} from "./load-jobs.mjs";

const {jobs}=await loadJobs();
const sources=JSON.parse(await fs.readFile(new URL("../content/source-registry.json",import.meta.url),"utf8"));
const network=JSON.parse(await fs.readFile(new URL("../content/network-map.json",import.meta.url),"utf8"));
const pr=JSON.parse(await fs.readFile(new URL("../content/pr-links.json",import.meta.url),"utf8"));
const insights=JSON.parse(await fs.readFile(new URL("../content/career-insights.json",import.meta.url),"utf8"));
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
const publishedJobs=jobs.filter(job=>job.status==="published");
const publishedSlugs=new Set(publishedJobs.map(job=>job.slug));
const insightSlugs=new Set();
for(const insight of insights){
  if(insightSlugs.has(insight.jobSlug))errors.push(`duplicate career insight: ${insight.jobSlug}`);insightSlugs.add(insight.jobSlug);
  if(!publishedSlugs.has(insight.jobSlug))errors.push(`${insight.jobSlug}: insight is not linked to a published career`);
  for(const key of ["industryRole","currentSignal","usefulness","adjacentJobs","transitionSummary","transitionFactors","evidenceToPrepare","jobChangeUse","internalUse","qualificationUses","dailyActions","sourceIds","checkedAt"]){if(insight[key]===undefined||insight[key]===null||insight[key]==="")errors.push(`${insight.jobSlug}: missing insight ${key}`)}
  const insightBody=[insight.industryRole,insight.currentSignal,insight.usefulness,insight.transitionSummary,...insight.transitionFactors,...insight.evidenceToPrepare,...insight.jobChangeUse,...insight.internalUse,...insight.dailyActions,...insight.adjacentJobs.map(item=>item.difference),...insight.qualificationUses.flatMap(item=>[item.jobChangeUse,item.internalUse])].join("");
  if(insightBody.length<700)errors.push(`${insight.jobSlug}: career insight body too short (${insightBody.length})`);
  if(insight.adjacentJobs.length<2)errors.push(`${insight.jobSlug}: at least two adjacent careers are required`);
  for(const adjacent of insight.adjacentJobs){if(adjacent.slug===insight.jobSlug)errors.push(`${insight.jobSlug}: adjacent career points to itself`);if(!publishedSlugs.has(adjacent.slug))errors.push(`${insight.jobSlug}: adjacent career is not published (${adjacent.slug})`)}
  if(insight.dailyActions.length!==3)errors.push(`${insight.jobSlug}: daily actions must contain exactly three steps`);
  const job=publishedJobs.find(candidate=>candidate.slug===insight.jobSlug);
  for(const id of insight.sourceIds){if(!sourceIds.has(id))errors.push(`${insight.jobSlug}: unknown insight source ${id}`);if(job&&!job.sourceIds.includes(id))errors.push(`${insight.jobSlug}: insight source is not declared by career (${id})`)}
  for(const use of insight.qualificationUses){if(!networkIds.has(use.networkId))errors.push(`${insight.jobSlug}: unknown qualification use ${use.networkId}`);if(job&&!job.qualifications.some(item=>item.networkId===use.networkId))errors.push(`${insight.jobSlug}: qualification use is not declared by career (${use.networkId})`)}
  const text=JSON.stringify(insight);for(const phrase of ["採用可能性は高い","転職難易度：高","転職難易度：低","必ず転職","採用を保証"]){if(text.includes(phrase))errors.push(`${insight.jobSlug}: prohibited insight phrase ${phrase}`)}
}
for(const job of publishedJobs)if(!insightSlugs.has(job.slug))errors.push(`${job.slug}: career insight missing`);
if(pr.enabled!==true&&pr.enabled!==false)errors.push("PR feature flag must be boolean");
if(JSON.stringify(jobs).includes("EPC")||JSON.stringify(jobs).includes("報酬額"))errors.push("editorial jobs contain monetization ranking data");
console.log(`content: ${jobs.length} jobs / ${publishedJobs.length} published / ${insights.length} career insights / ${sources.length} sources`);warnings.forEach(x=>console.warn(`WARN ${x}`));if(errors.length){errors.forEach(x=>console.error(`ERROR ${x}`));process.exit(1)}
