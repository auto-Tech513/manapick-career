"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import type { CareerJob } from "@/content/jobs";
import { trackEvent } from "@/lib/analytics";

const questions=[
  {title:"いま気になる方向は？",options:[{label:"仕組みや数字",tags:["仕組みを改善","数字を読む","正確に進める"]},{label:"表現や届け方",tags:["ものを作る","届け方を考える","見た目を整える"]},{label:"人を支える",tags:["人を支える","人と話す","人と調整"]}]},
  {title:"取り組みたい作業は？",options:[{label:"集中して作る・調べる",tags:["一人で集中","ものを作る","数字を読む"]},{label:"会話して整える",tags:["人と話す","人と調整","人を支える"]},{label:"正確に繰り返す",tags:["正確に進める","短く作る","資格で証明"]}]},
  {title:"週に使える学習時間は？",options:[{label:"3時間未満",tags:["週3時間未満"]},{label:"3〜7時間",tags:["週3時間以上","週3時間未満"]},{label:"7時間以上",tags:["週3時間以上"]}]},
];
export function RouteGuide({jobs}:{jobs:CareerJob[]}){const [step,setStep]=useState(0);const [answers,setAnswers]=useState<string[][]>([]);const done=step===questions.length;const results=useMemo(()=>{const tags=answers.flat();return jobs.map(job=>({job,score:job.routeTags.filter(t=>tags.includes(t)).length,reasons:job.routeTags.filter(t=>tags.includes(t))})).sort((a,b)=>b.score-a.score||a.job.name.localeCompare(b.job.name,"ja")).slice(0,3)},[answers,jobs]);
  function choose(tags:string[]){const next=[...answers,tags];setAnswers(next);try{localStorage.setItem("manapick-career-route",JSON.stringify(next))}catch{};if(next.length===questions.length)trackEvent("route_result",{candidate_count:3});setStep(x=>x+1)}
  function reset(){setAnswers([]);setStep(0);try{localStorage.removeItem("manapick-career-route")}catch{}}
  return <div className="route-card"><div className="privacy-note"><ShieldCheck aria-hidden="true"/><p><strong>回答はこの端末のlocalStorageだけに保存</strong><br/>サーバーやGA4へ回答内容を送りません。年齢・性別・国籍・障害・病歴・家族構成・収入は質問しません。</p></div>{!done?<><div className="progress" aria-label={`${step+1}/${questions.length}`}><span style={{width:`${((step+1)/questions.length)*100}%`}}/></div><p className="step-label">QUESTION {step+1} / {questions.length}</p><h2>{questions[step].title}</h2><div className="route-options">{questions[step].options.map(option=><button key={option.label} onClick={()=>choose(option.tags)}>{option.label}<ArrowRight aria-hidden="true"/></button>)}</div>{step>0?<button className="plain-button" onClick={()=>{setAnswers(x=>x.slice(0,-1));setStep(x=>x-1)}}><ArrowLeft/> 前の質問へ</button>:null}</>:<><div className="result-header"><span className="eyebrow">3つの候補</span><h2>ここから調べてみる仕事</h2><p>回答と重なる作業の観点から表示しています。順位や適性判定ではありません。</p></div><div className="route-results">{results.map(({job,reasons})=><article key={job.slug}><span>{job.category}</span><h3>{job.name}</h3><p>{job.conclusion[0]}</p><strong>候補にした理由</strong><p>{reasons.length?reasons.join("・"):"幅広い入口スキルから比較しやすい"}に関心が重なります。</p><Link href={`/career/${job.slug}/`}>仕事内容を確認する <ArrowRight/></Link></article>)}</div><button className="button secondary" onClick={reset}><RotateCcw/>もう一度選ぶ</button></>}</div>
}
