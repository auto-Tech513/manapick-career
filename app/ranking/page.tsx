import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PopularityRanking } from "@/components/PopularityRanking";
import { IncomeRanking, type IncomeRankEntry, type IncomeRankGroup } from "@/components/IncomeRanking";
import { NetworkSites } from "@/components/NetworkSites";
import { popularityMethod, popularityRanking } from "@/content/popularity-ranking";
import catalog from "@/content/job-catalog.json";
import { incomeOccupationByCatalogId, incomeStatisticByCode } from "@/lib/occupation-income";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "人気職業アクセスランキング・年収ランキング", description: "厚生労働省job tagのアクセス履歴に基づく人気職業ランキングと、賃金構造基本統計調査2025年の統計分類の平均年収換算による全体・ジャンル別年収ランキング。", alternates: { canonical: "/ranking/" } };

function incomeEntries(): IncomeRankEntry[] {
  const entries: IncomeRankEntry[] = [];
  for (const occupation of catalog.occupations) {
    const linked = incomeOccupationByCatalogId.get(occupation.catalogId);
    if (!linked || linked.status !== "available" || !linked.classificationCode) continue;
    const statistic = incomeStatisticByCode.get(linked.classificationCode);
    if (!statistic) continue;
    entries.push({ catalogId: occupation.catalogId, name: occupation.name, annualizedMeanYen: statistic.annualizedMeanYen, classificationName: statistic.classificationName });
  }
  return entries.sort((a, b) => b.annualizedMeanYen - a.annualizedMeanYen || a.name.localeCompare(b.name, "ja"));
}

export default function RankingPage() {
  const all = incomeEntries();
  const overall = all.slice(0, 10);
  const byCategory = new Map<string, IncomeRankEntry[]>();
  const catalogById = new Map(catalog.occupations.map(item => [item.catalogId, item]));
  for (const entry of all) {
    const key = catalogById.get(entry.catalogId)?.categoryKey;
    if (!key) continue;
    const list = byCategory.get(key) ?? [];
    if (list.length < 5) list.push(entry);
    byCategory.set(key, list);
  }
  const groups: IncomeRankGroup[] = catalog.categories
    .map(category => ({ key: category.key, label: category.label, entries: byCategory.get(category.key) ?? [] }))
    .filter(group => group.entries.length > 0);
  return <div className="page-shell ranking-page">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "人気職業アクセスランキング", numberOfItems: popularityRanking.length, itemListElement: popularityRanking.map((item) => ({ "@type": "ListItem", position: item.rank, name: item.name, url: item.careerSlug ? absoluteUrl(`/career/${item.careerSlug}/`) : absoluteUrl("/all/") })) }} />
    <header className="page-heading"><span className="eyebrow">公式アクセス履歴 × manapick連携</span><h1>人気職業アクセスランキング</h1><p>人気の順序はjob tagのアクセス履歴だけを使います。manapickの動画・AI・資格表示は、次に確認できる情報の有無であり、順位には一切加えていません。</p></header>
    <section className="ranking-method"><div><strong>順位の根拠</strong><p>{popularityMethod.description}</p></div><div><strong>この順位が示さないこと</strong><p>{popularityMethod.limitation}</p></div><a href={popularityMethod.sourceUrl} target="_blank" rel="noopener noreferrer">公式ランキングを確認 <ArrowUpRightIcon /></a><small>最終確認 {popularityMethod.checkedAt}</small></section>
    <PopularityRanking entries={popularityRanking} />
    <IncomeRanking overall={overall} groups={groups} />
    <NetworkSites />
  </div>;
}

function ArrowUpRightIcon() { return <span aria-hidden="true">↗</span>; }
