import type { Metadata } from "next";
import { CompareTool } from "@/components/CompareTool";
import { publishedJobs } from "@/content/jobs";
export const metadata:Metadata={title:"職業を比較",description:"最大3職種を仕事内容、学習負荷、資格、AI活用、入口スキルで比較します。",alternates:{canonical:"/compare/"}};
export default function ComparePage(){return <div className="page-shell wide"><div className="page-heading"><span className="eyebrow">優劣ではなく違いを見る</span><h1>職業を比較する</h1><p>仕事内容、学習負荷、資格、AI活用、入口スキルを横並びで確認できます。年収・将来性・転職しやすさの順位は作りません。</p></div><CompareTool jobs={publishedJobs}/></div>}
