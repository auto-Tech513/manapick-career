import "./compare.css";
import type { Metadata } from "next";
import { CompareTool } from "@/components/CompareTool";
import { OccupationCompareTool, type OccupationCompareItem } from "@/components/OccupationCompareTool";
import { publishedJobs } from "@/content/jobs";
import { occupationEmployers, publishedOccupationCatalog } from "@/content/catalog";
import { classificationOccupationCounts, formatManYen1dp, incomeOccupationByCatalogId, incomeStatisticByCode } from "@/lib/occupation-income";
import Link from "next/link";
import { PopularityRanking } from "@/components/PopularityRanking";
import { popularityMethod, popularityRanking } from "@/content/popularity-ranking";
export const metadata:Metadata={title:"職業を比較",description:"最大3つの職種を、仕事内容、学習負荷、資格、AI活用、入口スキルで並べて比較します。気になる職業同士の違いと共通点を一画面で確かめられます。比較に使うのは各職業ページで出典を確認した情報で、優劣の順位付けは行いません。気になる職業は、そのまま個別ページで詳しく確認できます。",alternates:{canonical:"/compare/", types: { "application/rss+xml": "/feed.xml" }}};
const occupationCompareItems: OccupationCompareItem[] = publishedOccupationCatalog.map((occupation) => {
  const entry = incomeOccupationByCatalogId.get(occupation.catalogId);
  const statistic = entry && entry.status === "available" && entry.classificationCode ? incomeStatisticByCode.get(entry.classificationCode) : undefined;
  return {
    catalogId: occupation.catalogId,
    name: occupation.name,
    aliases: occupation.aliases,
    summary: occupation.summary,
    income: statistic ? {
      annual: `${formatManYen1dp(statistic.annualizedMeanYen)}万円`,
      classificationName: statistic.classificationName,
      sharedCount: classificationOccupationCounts.get(statistic.classificationCode) ?? 1,
      meanAge: statistic.meanAge.toFixed(1),
      workers: statistic.estimatedWorkers.toLocaleString("ja-JP"),
    } : null,
    employerCount: occupationEmployers(occupation.catalogId).length,
    qualifications: occupation.qualifications,
  };
});
export default function ComparePage(){return <div className="page-shell wide"><nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><span aria-current="page">比較</span></nav><header className="phead"><p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-CMP · 比較</p><h1>職業を比較する</h1><p className="phead-lead">仕事内容、学習負荷、資格、AI活用、入口スキルを横並びで確認できます。年収・将来性・転職しやすさの順位は作りません。</p><div className="phead-meta"><span><b>見方</b>優劣ではなく違いを見る</span></div></header><CompareTool jobs={publishedJobs}/><section className="compare-occupations"><div className="sh"><div><p className="sh-k">STATISTICS — 個別ページの統計で比べる</p><h2 className="phrase-breaks">個別ページのある<wbr />120職業を、<wbr />公式統計で<wbr />比較する</h2><p>上の16職業の深掘り比較にはない職業も、年収の目安・平均年齢・働く人の数・関連資格・企業例で並べて確認できます。年収は2025年賃金構造基本統計調査の対応分類による平均年収換算で、分類を共有する職業には同じ値が表示されます。優劣の順位付けは行いません。</p></div></div><OccupationCompareTool items={occupationCompareItems}/></section><section className="compare-ranking"><div className="sh"><div><p className="sh-k">POPULAR — 関心の入口</p><h2 className="phrase-breaks">job tag<wbr />アクセス<wbr />上位10職業</h2><p>{popularityMethod.limitation}</p></div><Link href="/ranking/">12位まで見る</Link></div><PopularityRanking entries={popularityRanking.slice(0,10)} compact /></section></div>}
