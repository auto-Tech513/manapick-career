import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('content/job-catalog.json',root),'utf8'));
const corrections=JSON.parse(await fs.readFile(new URL('content/occupation-corrections.json',root),'utf8'));
const evidence=JSON.parse(await fs.readFile(new URL('content/career-evidence.json',root),'utf8'));
const employerRegistry=JSON.parse(await fs.readFile(new URL('content/occupation-employers.json',root),'utf8'));
const dossiers=JSON.parse(await fs.readFile(new URL('content/career-dossiers.json',root),'utf8'));
const digest=createHash('sha256').update(JSON.stringify({occupations: catalog.occupations, corrections, evidence, employerRegistry, dossiers})).digest('hex').slice(0,12);
await fs.mkdir(new URL('public/data/occupation-briefs/',root),{recursive:true});
for(const row of catalog.occupations){
 const correction=corrections.items.find(item=>item.catalogId===row.catalogId);
 const existing=employerRegistry.existingDossiers.find(item=>item.catalogId===row.catalogId);
 const dossier=existing && dossiers.items.find(item=>item.slug===existing.slug);
 const employers=dossier ? dossier.employers.map(item=>{const source=evidence.sources.find(source=>source.id===item.sourceId); if (!source) throw new Error(`Missing employer source ${item.sourceId}`); return {name:item.name,role:item.role,description:item.description,source:{title:source.title,url:source.url,checkedAt:source.accessedAt}};}) : (employerRegistry.items.find(item=>item.catalogId===row.catalogId)?.employers ?? []);
 const payload={schemaVersion:1,catalogId:row.catalogId,name:row.name,work:row.work,entry:row.entry,conditions:row.conditions,qualifications:row.qualifications,updatedYears:row.updatedYears,employers,...(correction?{correction:{...correction,sources:correction.sourceIds.map(id=>evidence.sources.find(item=>item.id===id))}}:{}),source:{title:catalog.source.title,provider:catalog.source.provider,url:catalog.source.downloadPage,importedAt:catalog.source.importedAt,retrievedAt:catalog.source.retrievedAt,datasetSha256:catalog.source.datasetSha256,version:'7.01'}};
 await fs.writeFile(new URL(`public/data/occupation-briefs/${row.catalogId}.json`,root),JSON.stringify(payload));
}
await fs.writeFile(new URL('public/data/occupation-briefs/manifest.json',root),JSON.stringify({schemaVersion:1,digest,count:catalog.occupations.length,source:catalog.source.downloadPage,retrievedAt:catalog.source.retrievedAt}));
console.log(`occupation briefs: ${catalog.occupations.length} source-attributed reading panels, digest ${digest}; no occupation routes generated`);
