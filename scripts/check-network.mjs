import fs from 'node:fs';import assert from 'node:assert/strict';
const map=JSON.parse(fs.readFileSync(new URL('../content/network-map-shared.json',import.meta.url)));
const affiliate=JSON.parse(fs.readFileSync(new URL('../content/affiliate-settings.json',import.meta.url)));
assert.equal(map.version,1);assert(map.relations.length);assert.equal(new Set(map.relations.map(r=>r.id)).size,map.relations.length);
assert(/^[a-z0-9-]+-22$/.test(affiliate.amazonTag));
for(const group of map.relations){assert(group.evidence.length>0,group.id);assert(group.nodes.length>=2,group.id);for(const node of group.nodes){const url=new URL(node.url);assert.equal(url.origin,map.sites[node.site]);assert(!url.pathname.startsWith('/category/'));assert(!url.search,'mapping URLs are canonical and untracked');}}
for(const site of Object.keys(map.sites))assert.equal(new URL(map.sites[site]).protocol,'https:');
assert(map.relations.find(r=>r.id==='takken-AETcTrEOu9A').nodes.some(n=>n.url==='https://license.manapick.app/license/takken/'));
console.log(`network: ${map.relations.length} associations, canonical individual URLs, evidence fields, Amazon setting validated`);
