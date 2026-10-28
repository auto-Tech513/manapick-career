import { NetworkCard } from "./NetworkCard";
import Link from "next/link";
import type { CareerCard } from "@/lib/career-card";
import { ArrowUpRight } from "lucide-react";

export function JobCard({job}:{job:CareerCard}){return <NetworkCard className="job-card">
  <div className="job-card-top"><span className={`category-dot cat-${job.category}`}/><span>{job.tasks.slice(0,2).join("・")}</span></div>
  <h3><Link href={`/career/${job.slug}/`}>{job.name}</Link></h3>
  <p>{job.conclusion[0]}</p>
  <div className="chips">{job.entrySkills.slice(0,3).map((x)=><span key={x}>{x}</span>)}</div>
  <Link className="card-link" href={`/career/${job.slug}/`}>仕事の入口を見る <ArrowUpRight aria-hidden="true"/></Link>
</NetworkCard>}
