"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CareerJob } from "@/content/jobs";
import { JobCard } from "./JobCard";

type Category={key:string;label:string;description:string};
export function CareerExplorer({jobs,categories}:{jobs:CareerJob[];categories:Category[]}){
  const [query,setQuery]=useState("");const [category,setCategory]=useState("all");
  const filtered=useMemo(()=>jobs.filter(job=>(category==="all"||job.category===category)&&`${job.name} ${job.tasks.join(" ")} ${job.skills.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),[jobs,query,category]);
  return <section className="explorer" aria-labelledby="explorer-title"><div className="explorer-head"><div><span className="eyebrow">12の職業から探す</span><h2 id="explorer-title">気になる仕事を、言葉で探す。</h2></div><label className="search-box"><Search aria-hidden="true"/><span className="sr-only">職業を検索</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="例：数字、デザイン、人を支える"/></label></div>
  <div className="category-tabs" role="group" aria-label="カテゴリで絞り込む"><button className={category==="all"?"active":""} onClick={()=>setCategory("all")}>すべて</button>{categories.map(c=><button key={c.key} className={category===c.key?"active":""} onClick={()=>setCategory(c.key)}>{c.label}</button>)}</div>
  <p className="result-count" aria-live="polite">{filtered.length}件を表示</p><div className="job-grid">{filtered.map(job=><JobCard key={job.slug} job={job}/>)}</div>{filtered.length===0?<p className="empty">条件に合う職業がありません。検索語を短くしてみてください。</p>:null}
  </section>
}
