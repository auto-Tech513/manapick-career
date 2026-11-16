"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { categories, type CareerJob } from "@/content/jobs";
import { trackEvent } from "@/lib/analytics";
import { careerInsightBySlug } from "@/lib/career-insights";

export function CompareTool({jobs}:{jobs:CareerJob[]}){
  const [selected,setSelected]=useState<string[]>(jobs.slice(0,2).map(x=>x.slug));
  const chosen=selected.map(slug=>jobs.find(x=>x.slug===slug)).filter(Boolean) as CareerJob[];
  function toggle(slug:string){setSelected(current=>{const next=current.includes(slug)?current.filter(x=>x!==slug):current.length<3?[...current,slug]:current;trackEvent("compare",{selected_count:next.length});return next})}
  const insight=(job:CareerJob)=>careerInsightBySlug.get(job.slug);
  return <div className="compare-tool">
    <div className="compare-picker">
      <div className="bar">
        <p className="cnt"><b>{selected.length}</b>件選択中（最大3つまで）</p>
        <div className="act" aria-label="選択中の職業">
          {chosen.map(job=><button key={job.slug} onClick={()=>toggle(job.slug)} aria-pressed="true" aria-label={`${job.name}を比較から外す`}>{job.name}<X aria-hidden="true"/></button>)}
        </div>
      </div>
      {!chosen.length?<p className="compare-none">まだ選ばれていません。下の候補から選んでください。</p>:null}
      <div className="compare-options" aria-label="職業の候補">{jobs.filter(job=>!selected.includes(job.slug)).map(job=><button key={job.slug} disabled={selected.length>=3} onClick={()=>toggle(job.slug)} aria-pressed="false">{job.name}</button>)}</div>
      {selected.length>=3?<p className="compare-limit">最大3つまでです。外すには上のチップをタップしてください。</p>:null}
    </div>
    {chosen.length?<>
      <div className={chosen.length>=3?"cmp2-scroll is-scroll":"cmp2-scroll"}>
        <div className="cmp2" role="table" aria-label="選択した職業の項目別比較" style={{"--n":chosen.length} as CSSProperties}>
          <div className="hdr" role="row">
            <div role="columnheader">COMPARE</div>
            {chosen.map(job=><div role="columnheader" key={job.slug}><p className="nm">{job.name}</p><p className="tg">{categories.find(c=>c.key===job.category)?.label ?? job.category}</p></div>)}
          </div>
          <p className="sec2">仕事の内容</p>
          <div className="grp" role="row"><div role="rowheader">仕事内容</div>{chosen.map(job=><div role="cell" key={job.slug}>{job.conclusion[0]}</div>)}</div>
          <div className="grp" role="row"><div role="rowheader">業界で担う役割</div>{chosen.map(job=><div role="cell" key={job.slug}>{insight(job)?.industryRole}</div>)}</div>
          <div className="grp" role="row"><div role="rowheader">似た職業との違い</div>{chosen.map(job=><div role="cell" key={job.slug}><ul>{insight(job)?.adjacentJobs.map(item=>{const adjacent=jobs.find(candidate=>candidate.slug===item.slug);return <li key={item.slug}><strong>{adjacent?.name}</strong><small>{item.difference}</small></li>})}</ul></div>)}</div>
          <p className="sec2">学びと入口</p>
          <div className="grp" role="row"><div role="rowheader">学習負荷の見方</div>{chosen.map(job=><div role="cell" key={job.slug}><strong>{job.learningLoad}</strong><small>{job.learningTime}</small></div>)}</div>
          <div className="grp" role="row"><div role="rowheader">入口スキル</div>{chosen.map(job=><div role="cell" key={job.slug}><ul>{job.entrySkills.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div>
          <div className="grp" role="row"><div role="rowheader">関連資格</div>{chosen.map(job=><div role="cell" key={job.slug}>{job.qualifications.length?job.qualifications.map(x=>x.label).join("、"):"必須と断定できる資格なし"}</div>)}</div>
          <p className="sec2">進み方と注意点</p>
          <div className="grp" role="row"><div role="rowheader">転職準備を左右する条件</div>{chosen.map(job=><div role="cell" key={job.slug}><ul>{insight(job)?.transitionFactors.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div>
          <div className="grp" role="row"><div role="rowheader">応募前に作る証拠</div>{chosen.map(job=><div role="cell" key={job.slug}><ul>{insight(job)?.evidenceToPrepare.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div>
          <div className="grp" role="row"><div role="rowheader">社内での活かし方</div>{chosen.map(job=><div role="cell" key={job.slug}><ul>{insight(job)?.internalUse.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div>
          <div className="grp" role="row"><div role="rowheader">AI活用</div>{chosen.map(job=><div role="cell" key={job.slug}>{job.ai.map(x=>`${x.label}：${x.use}`).join("／")}</div>)}</div>
          <div className="grp" role="row"><div role="rowheader">注意点</div>{chosen.map(job=><div role="cell" key={job.slug}>{job.cautions[0]}</div>)}</div>
          <div className="grp" role="row"><div role="rowheader">詳しく見る</div>{chosen.map(job=><div role="cell" key={job.slug}><Link href={`/career/${job.slug}/`}>入口を見る <ArrowRight/></Link></div>)}</div>
        </div>
      </div>
      <div className="verdict" style={{"--n":chosen.length} as CSSProperties}>
        {chosen.map(job=><div key={job.slug}><b>{job.name}</b><p>{job.conclusion[1]}</p></div>)}
      </div>
    </>:<p className="empty">比較する職業を1つ以上選んでください。</p>}
  </div>
}
