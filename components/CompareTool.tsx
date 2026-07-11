"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { CareerJob } from "@/content/jobs";
import { trackEvent } from "@/lib/analytics";

export function CompareTool({jobs}:{jobs:CareerJob[]}){const [selected,setSelected]=useState<string[]>(jobs.slice(0,2).map(x=>x.slug));const chosen=selected.map(slug=>jobs.find(x=>x.slug===slug)).filter(Boolean) as CareerJob[];
function toggle(slug:string){setSelected(current=>{const next=current.includes(slug)?current.filter(x=>x!==slug):current.length<3?[...current,slug]:current;trackEvent("compare",{selected_count:next.length});return next})}
return <div className="compare-tool"><div className="compare-picker"><strong>比較する職業（最大3つ）</strong><div>{jobs.map(job=><button key={job.slug} className={selected.includes(job.slug)?"selected":""} onClick={()=>toggle(job.slug)} aria-pressed={selected.includes(job.slug)}>{job.name}{selected.includes(job.slug)?<X aria-hidden="true"/>:null}</button>)}</div></div><div className="compare-scroll" tabIndex={0} aria-label="職業比較表"><table><thead><tr><th>比較項目</th>{chosen.map(job=><th key={job.slug}>{job.name}</th>)}</tr></thead><tbody>
  <tr><th>仕事内容</th>{chosen.map(job=><td key={job.slug}>{job.conclusion[0]}</td>)}</tr>
  <tr><th>学習負荷の見方</th>{chosen.map(job=><td key={job.slug}><strong>{job.learningLoad}</strong><small>{job.learningTime}</small></td>)}</tr>
  <tr><th>入口スキル</th>{chosen.map(job=><td key={job.slug}><ul>{job.entrySkills.map(x=><li key={x}>{x}</li>)}</ul></td>)}</tr>
  <tr><th>関連資格</th>{chosen.map(job=><td key={job.slug}>{job.qualifications.length?job.qualifications.map(x=>x.label).join("、"):"必須と断定できる資格なし"}</td>)}</tr>
  <tr><th>AI活用</th>{chosen.map(job=><td key={job.slug}>{job.ai.map(x=>`${x.label}：${x.use}`).join("／")}</td>)}</tr>
  <tr><th>注意点</th>{chosen.map(job=><td key={job.slug}>{job.cautions[0]}</td>)}</tr>
  <tr><th>詳しく見る</th>{chosen.map(job=><td key={job.slug}><Link href={`/career/${job.slug}/`}>入口を見る <ArrowRight/></Link></td>)}</tr>
</tbody></table></div>{!chosen.length?<p className="empty">比較する職業を1つ以上選んでください。</p>:null}</div>}
