import { routeCandidate } from "@/lib/career-card";
import type { Metadata } from "next";
import { RouteGuide } from "@/components/RouteGuide";
import { publishedJobs, categories } from "@/content/jobs";
export const metadata:Metadata={title:"キャリア候補の入口案内",description:"興味・取り組みたい作業・学習時間の3問から、調べ始める職業候補を3つ提示します。",alternates:{canonical:"/route/"}};
export default function RoutePage(){return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">入口案内</span><h1>キャリア候補の入口案内</h1><p>興味、取り組みたい作業、使える学習時間だけを使い、調べ始める候補を3つ提示します。</p></div><RouteGuide jobs={publishedJobs.map(job=>routeCandidate(job,categories.find(category=>category.key===job.category)?.label ?? "職業情報"))}/></div>}
