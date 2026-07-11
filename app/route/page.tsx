import type { Metadata } from "next";
import { RouteGuide } from "@/components/RouteGuide";
import { publishedJobs } from "@/content/jobs";
export const metadata:Metadata={title:"キャリア候補の入口案内",description:"興味・取り組みたい作業・学習時間の3問から、調べ始める職業候補を3つ提示します。",alternates:{canonical:"/route/"}};
export default function RoutePage(){return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">適性検査ではありません</span><h1>キャリア候補の入口案内</h1><p>興味、取り組みたい作業、使える学習時間だけを使い、調べ始める候補を3つ提示します。職業適性や採用可能性を保証しません。</p></div><RouteGuide jobs={publishedJobs}/></div>}
