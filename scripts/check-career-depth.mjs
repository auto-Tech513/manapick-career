import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadJobs} from './load-jobs.mjs';
const read=async name=>JSON.parse(await fs.readFile(new URL(`../content/${name}`,import.meta.url),'utf8'));
const [{publishedJobs},dossiers,evidence,catalog,network]=await Promise.all([loadJobs(),read('career-dossiers.json'),read('career-evidence.json'),read('job-catalog.json'),read('network-map-shared.json')]);
const byId=new Map(evidence.sources.map(item=>[item.id,item]));
assert.equal(byId.size,evidence.sources.length,'duplicate evidence ID');
assert.deepEqual([...dossiers.items.map(x=>x.slug)].sort(),publishedJobs.map(x=>x.slug).sort(),'every published job needs a dossier');
for(const source of evidence.sources){
 assert.equal(new URL(source.url).protocol,'https:');
 assert.equal(source.humanReview,false,'do not fabricate human review');
 assert.equal(source.method,'AI-readable-primary-source-comparison');
 assert(source.provider&&source.title&&source.support&&/^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt));
}
const sameOriginLicense=new Set(network.relations.flatMap(r=>r.nodes).filter(n=>n.kind==='license').map(n=>new URL(n.url).pathname));
const seen=new Set();
for(const item of dossiers.items){
 assert(!seen.has(item.slug));seen.add(item.slug);
 assert.equal(item.humanReview,false);assert.equal(item.method,'AI-primary-source-synthesis');
 assert(item.context.length>=3);
 assert.equal(item.workflow.length,4,`${item.slug}: work stages missing`);
 assert(item.fit.length>=3&&item.qualifications.length>=1&&item.employers.length>=2,`${item.slug}: core reader questions unanswered`);
 assert(item.summary.length>=100&&item.scope.length>=40,`${item.slug}: scope too shallow`);
 for(const id of item.sourceIds)assert(byId.has(id),`${item.slug}: unknown source ${id}`);
 for(const step of item.workflow)assert(step.title&&step.activity.length>=60&&step.deliverable,`${item.slug}: work without action/output`);
 for(const point of item.fit)assert(point.interest&&point.reason.length>=45,`${item.slug}: unsupported suitability label`);
 for(const q of item.qualifications){assert(item.sourceIds.includes(q.sourceId));assert(['qualification','institution'].includes(byId.get(q.sourceId)?.kind));assert(q.position&&q.learn.length>=35&&q.limits.length>=30);if(q.licensePath)assert(sameOriginLicense.has(q.licensePath),`${item.slug}: qualification page not in evidence-backed network map (${q.licensePath})`);}
 for(const employer of item.employers){assert(item.sourceIds.includes(employer.sourceId));assert.equal(byId.get(employer.sourceId)?.kind,'employer');assert(employer.name&&employer.role&&employer.description.length>=35&&employer.scope,`${item.slug}: company name without job evidence`);}
 for(const number of item.catalogRecordNumbers)assert(catalog.occupations.some(row=>row.recordNumber===number));
 assert(item.exercise.task&&item.exercise.checkpoints.length>=3);
 const substantive=[item.summary,...item.context,...item.workflow.flatMap(x=>[x.activity,x.deliverable]),...item.fit.map(x=>x.reason),...item.qualifications.flatMap(x=>[x.learn,x.limits]),...item.employers.map(x=>x.description)].join('');
 assert(substantive.length>=1200,`${item.slug}: only ${substantive.length} substantive characters`);
}
// Catch accidental copy/paste across the newly authored explanations.
const grams=text=>new Set([...text].slice(0,-4).map((_,i)=>text.slice(i,i+5)));
let maxOverlap=0;
for(let a=0;a<dossiers.items.length;a++)for(let b=a+1;b<dossiers.items.length;b++){
 const text=item=>[item.summary,...item.workflow.map(x=>x.activity),...item.fit.map(x=>x.reason)].join('');
 const x=grams(text(dossiers.items[a])),y=grams(text(dossiers.items[b]));
 const common=[...x].filter(g=>y.has(g)).length;const overlap=common/Math.min(x.size,y.size);maxOverlap=Math.max(maxOverlap,overlap);
 assert(overlap<0.35,`overlapping explanations: ${dossiers.items[a].slug}/${dossiers.items[b].slug}`);
}
let briefBytes=0;
for(const row of catalog.occupations){
 const raw=await fs.readFile(new URL(`../public/data/occupation-briefs/${row.catalogId}.json`,import.meta.url),'utf8');const brief=JSON.parse(raw);briefBytes+=Buffer.byteLength(raw);
 for(const key of ['catalogId','name','work','entry','conditions','qualifications','updatedYears'])assert.deepEqual(brief[key],row[key],`${row.catalogId}: changed official field ${key}`);
 assert.equal(brief.source.datasetSha256,catalog.source.datasetSha256);assert(brief.source.retrievedAt&&brief.source.title&&brief.source.provider);
}
const result={dossiers:dossiers.items.length,evidenceSources:evidence.sources.length,employerExamples:dossiers.items.reduce((n,x)=>n+x.employers.length,0),qualificationEntries:dossiers.items.reduce((n,x)=>n+x.qualifications.length,0),inlineOfficialBriefs:catalog.occupations.length,briefBytes,maxPairwiseFiveCharacterOverlap:maxOverlap,dossierSha256:createHash('sha256').update(JSON.stringify(dossiers)).digest('hex')};
console.log(JSON.stringify(result,null,2));
