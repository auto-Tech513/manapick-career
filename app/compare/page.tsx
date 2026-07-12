import type { Metadata } from "next";
import { CompareTool } from "@/components/CompareTool";
import { publishedJobs } from "@/content/jobs";
import Link from "next/link";
import { PopularityRanking } from "@/components/PopularityRanking";
import { popularityMethod, popularityRanking } from "@/content/popularity-ranking";
export const metadata:Metadata={title:"職業を比較",description:"最大3職種を仕事内容、学習負荷、資格、AI活用、入口スキルで比較します。",alternates:{canonical:"/compare/"}};
export default function ComparePage(){return <div className="page-shell wide"><div className="page-heading"><span className="eyebrow">優劣ではなく違いを見る</span><h1>職業を比較する</h1><p>仕事内容、学習負荷、資格、AI活用、入口スキルを横並びで確認できます。年収・将来性・転職しやすさの順位は作りません。</p></div><CompareTool jobs={publishedJobs}/><section className="compare-ranking"><div className="section-heading row"><div><span className="eyebrow">関心の入口</span><h2>job tagアクセス上位10職業</h2><p>{popularityMethod.limitation}</p></div><Link href="/ranking/">12位まで見る</Link></div><PopularityRanking entries={popularityRanking.slice(0,10)} compact /></section></div>}
