import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../content/${name}`,import.meta.url),'utf8'));
const income=read('occupation-income.json'),catalog=read('job-catalog.json'),scopes=read('career-income-scope.json'),dossiers=read('career-dossiers.json');
assert.equal(income.humanReview,false);assert.equal(income.surveyYear,2025);assert.equal(income.annualMedian.status,'not_available');
assert.equal(income.occupations.length,556);assert.equal(new Set(income.occupations.map(x=>x.catalogId)).size,556);
assert.equal(income.occupations.filter(x=>x.status==='available').length,544);assert.equal(income.occupations.filter(x=>x.status==='not_available').length,12);assert.equal(income.statistics.length,135);
const groups=new Map(income.statistics.map(x=>[x.classificationCode,x]));
for(const row of catalog.occupations){const match=income.occupations.find(x=>x.catalogId===row.catalogId);assert.equal(match.name,row.name);assert.equal(match.recordNumber,row.recordNumber);if(match.status==='available')assert(groups.has(match.classificationCode));else assert.equal(match.classificationCode,null);}
for(const group of groups.values()){assert.equal(group.annualizedMeanYen,Math.round((Number(group.monthlyCashThousandYen)*12+Number(group.annualBonusThousandYen))*1000));assert(group.sourceRow>=11&&group.sourceRow<=155);assert(group.cells.monthly===`H${group.sourceRow}`&&group.cells.bonus===`J${group.sourceRow}`);}
for(const source of income.sources.filter(x=>x.file)){assert.equal(createHash('sha256').update(fs.readFileSync(new URL(`../${source.file}`,import.meta.url))).digest('hex'),source.sha256);}
assert.deepEqual(scopes.items.map(x=>x.slug).sort(),dossiers.items.map(x=>x.slug).sort());for(const scope of scopes.items){assert(scope.explanation.length>30);for(const id of scope.recordNumbers)assert(income.occupations.some(x=>x.recordNumber===id));}
for(const [id,amount,label] of [['92',8108100,'公認会計士，税理士'],['89',9811100,'法務従事者'],['156',5247200,'看護師'],['131',4276300,'保育士']]){const item=income.occupations.find(x=>x.recordNumber===id);const group=groups.get(item.classificationCode);assert.equal(group.annualizedMeanYen,amount);assert.equal(group.classificationName,label);}
console.log('income: 556 exact occupation matches; 544 mapped / 12 unavailable; 135 statistical groups; 16 page scopes; formula, sex block, units and workbook hashes validated');
