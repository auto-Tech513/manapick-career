"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { CareerJob } from "@/content/jobs";
import { trackEvent } from "@/lib/analytics";
import { careerInsightBySlug } from "@/lib/career-insights";

export function CompareTool({jobs}:{jobs:CareerJob[]}){const [selected,setSelected]=useState<string[]>(jobs.slice(0,2).map(x=>x.slug));const chosen=selected.map(slug=>jobs.find(x=>x.slug===slug)).filter(Boolean) as CareerJob[];
function toggle(slug:string){setSelected(current=>{const next=current.includes(slug)?current.filter(x=>x!==slug):current.length<3?[...current,slug]:current;trackEvent("compare",{selected_count:next.length});return next})}
return <div className="compare-tool"><div className="compare-picker"><div className="compare-picker-head"><strong>比較する職業（最大3つ）</strong><span className="compare-count" aria-live="polite">{selected.length}/3 選択中</span></div><div className="compare-selected" aria-label="選択中の職業">{chosen.map(job=><button key={job.slug} className="selected" onClick={()=>toggle(job.slug)} aria-pressed="true">{job.name}<X aria-hidden="true"/></button>)}{!chosen.length?<p className="compare-none">まだ選ばれていません。下の候補から選んでください。</p>:null}</div><div className="compare-options" aria-label="職業の候補">{jobs.filter(job=>!selected.includes(job.slug)).map(job=><button key={job.slug} disabled={selected.length>=3} onClick={()=>toggle(job.slug)} aria-pressed="false">{job.name}</button>)}</div>{selected.length>=3?<p className="compare-limit">最大3つまでです。外すには上のチップをタップしてください。</p>:null}</div><div className="compare-scroll" tabIndex={0} aria-label="職業比較表"><table><caption className="sr-only">選択した職業の項目別比較</caption><thead><tr><th scope="col">比較項目</th>{chosen.map(job=><th scope="col" key={job.slug}>{job.name}</th>)}</tr></thead><tbody>
  <tr><th scope="row">仕事内容</th>{chosen.map(job=><td data-job={job.name} key={job.slug}>{job.conclusion[0]}</td>)}</tr>
  <tr><th scope="row">業界で担う役割</th>{chosen.map(job=><td data-job={job.name} key={job.slug}>{careerInsightBySlug.get(job.slug)?.industryRole}</td>)}</tr>
  <tr><th scope="row">似た職業との違い</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><ul>{careerInsightBySlug.get(job.slug)?.adjacentJobs.map(item=>{const adjacent=jobs.find(candidate=>candidate.slug===item.slug);return <li key={item.slug}><strong>{adjacent?.name}</strong><small>{item.difference}</small></li>})}</ul></td>)}</tr>
  <tr><th scope="row">学習負荷の見方</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><strong>{job.learningLoad}</strong><small>{job.learningTime}</small></td>)}</tr>
  <tr><th scope="row">入口スキル</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><ul>{job.entrySkills.map(x=><li key={x}>{x}</li>)}</ul></td>)}</tr>
  <tr><th scope="row">転職準備を左右する条件</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><ul>{careerInsightBySlug.get(job.slug)?.transitionFactors.map(item=><li key={item}>{item}</li>)}</ul></td>)}</tr>
  <tr><th scope="row">応募前に作る証拠</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><ul>{careerInsightBySlug.get(job.slug)?.evidenceToPrepare.map(item=><li key={item}>{item}</li>)}</ul></td>)}</tr>
  <tr><th scope="row">関連資格</th>{chosen.map(job=><td data-job={job.name} key={job.slug}>{job.qualifications.length?job.qualifications.map(x=>x.label).join("、"):"必須と断定できる資格なし"}</td>)}</tr>
  <tr><th scope="row">社内での活かし方</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><ul>{careerInsightBySlug.get(job.slug)?.internalUse.map(item=><li key={item}>{item}</li>)}</ul></td>)}</tr>
  <tr><th scope="row">AI活用</th>{chosen.map(job=><td data-job={job.name} key={job.slug}>{job.ai.map(x=>`${x.label}：${x.use}`).join("／")}</td>)}</tr>
  <tr><th scope="row">注意点</th>{chosen.map(job=><td data-job={job.name} key={job.slug}>{job.cautions[0]}</td>)}</tr>
  <tr><th scope="row">詳しく見る</th>{chosen.map(job=><td data-job={job.name} key={job.slug}><Link href={`/career/${job.slug}/`}>入口を見る <ArrowRight/></Link></td>)}</tr>
</tbody></table></div>{!chosen.length?<p className="empty">比較する職業を1つ以上選んでください。</p>:null}</div>}
