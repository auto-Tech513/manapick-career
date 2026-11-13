import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PopularityRanking } from "@/components/PopularityRanking";
import { IncomeRanking, type IncomeRankEntry, type IncomeRankGroup } from "@/components/IncomeRanking";
import { ExtraRankings, type ExtraRanking } from "@/components/ExtraRankings";
import { NetworkSites } from "@/components/NetworkSites";
import { popularityMethod, popularityRanking } from "@/content/popularity-ranking";
import catalog from "@/content/job-catalog.json";
import incomeData from "@/content/occupation-income.json";
import { formatManYen1dp, incomeOccupationByCatalogId, incomeStatisticByCode } from "@/lib/occupation-income";
import { absoluteUrl } from "@/lib/site";
import "./ranking.css";

export const metadata: Metadata = { title: "人気職業アクセスランキング・年収ランキング", description: "厚生労働省job tagのアクセス履歴に基づく人気職業ランキングと、賃金構造基本統計調査2025年の統計分類で見る年収・ボーナス・平均年齢・働く人数のランキング。ジャンル絞り込み付き。各ランキングには、数字が示す範囲と示さないことも注記しています。ジャンルで絞ると、分野ごとの上位10件も確認できます。", alternates: { canonical: "/ranking/", types: { "application/rss+xml": "/feed.xml" } } };

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

function groupByCategory(all: IncomeRankEntry[], limit: number): IncomeRankGroup[] {
  const byCategory = new Map<string, IncomeRankEntry[]>();
  const catalogById = new Map(catalog.occupations.map(item => [item.catalogId, item]));
  for (const entry of all) {
    const key = catalogById.get(entry.catalogId)?.categoryKey;
    if (!key) continue;
    const list = byCategory.get(key) ?? [];
    if (list.length < limit) list.push(entry);
    byCategory.set(key, list);
  }
  return catalog.categories
    .map(category => ({ key: category.key, label: category.label, entries: byCategory.get(category.key) ?? [] }))
    .filter(group => group.entries.length > 0);
}

type ClassificationRow = {
  classificationName: string;
  bonusYen: number;
  share: number;
  meanAge: number;
  workers: number;
  annualizedMeanYen: number;
  occupationNames: string[];
};

function classificationRows(): ClassificationRow[] {
  const namesByCode = new Map<string, Array<{ record: number; name: string }>>();
  for (const occupation of incomeData.occupations) {
    if (occupation.status !== "available" || !occupation.classificationCode) continue;
    const list = namesByCode.get(occupation.classificationCode) ?? [];
    list.push({ record: Number(occupation.recordNumber), name: occupation.name });
    namesByCode.set(occupation.classificationCode, list);
  }
  const rows: ClassificationRow[] = [];
  for (const statistic of incomeData.statistics) {
    const bonusYen = Number(statistic.annualBonusThousandYen) * 1000;
    if (!Number.isFinite(bonusYen) || !statistic.annualizedMeanYen) continue;
    const names = (namesByCode.get(statistic.classificationCode) ?? []).sort((a, b) => a.record - b.record).map(item => item.name);
    rows.push({
      classificationName: statistic.classificationName,
      bonusYen,
      share: bonusYen / statistic.annualizedMeanYen,
      meanAge: statistic.meanAge,
      workers: statistic.estimatedWorkers,
      annualizedMeanYen: statistic.annualizedMeanYen,
      occupationNames: names,
    });
  }
  return rows;
}

function extraRankings(): ExtraRanking[] {
  const rows = classificationRows();
  const toEntries = (sorted: ClassificationRow[], value: (row: ClassificationRow) => string) => sorted.slice(0, 10).map(row => ({
    classificationName: row.classificationName,
    value: value(row),
    examples: row.occupationNames.slice(0, 3),
    occupationCount: row.occupationNames.length,
  }));
  const byName = (a: ClassificationRow, b: ClassificationRow) => a.classificationName.localeCompare(b.classificationName, "ja");
  return [
    { id: "bonus", title: "ボーナスが多いランキング", note: "年間賞与その他特別給与額の分類平均です。賞与は業績や制度で変わり、支給されない職場もあります。", entries: toEntries([...rows].sort((a, b) => b.bonusYen - a.bonusYen || b.annualizedMeanYen - a.annualizedMeanYen || byName(a, b)), (row) => `${formatManYen1dp(row.bonusYen)}万円`) },
    { id: "bonus-share", title: "ボーナス割合が高いランキング", note: "平均年収換算のうち賞与が占める割合です。割合が高いほど、収入が賞与の変動に左右されます。", entries: toEntries([...rows].sort((a, b) => b.share - a.share || b.bonusYen - a.bonusYen || byName(a, b)), (row) => `${(row.share * 100).toFixed(1)}%`) },
    { id: "young", title: "若手が多いランキング（平均年齢が低い順）", note: "その分類で働く人の平均年齢です。若い人が多いことと、未経験で入りやすいことは別です。", entries: toEntries([...rows].sort((a, b) => a.meanAge - b.meanAge || b.workers - a.workers || byName(a, b)), (row) => `平均${row.meanAge.toFixed(1)}歳`) },
    { id: "veteran", title: "ベテランが多いランキング（平均年齢が高い順）", note: "その分類で働く人の平均年齢です。平均年齢は、勤続年数の長さそのものではありません。", entries: toEntries([...rows].sort((a, b) => b.meanAge - a.meanAge || b.workers - a.workers || byName(a, b)), (row) => `平均${row.meanAge.toFixed(1)}歳`) },
    { id: "workers", title: "働いている人が多いランキング", note: "その分類で働く人の推計人数です。求人数や採用のしやすさを示す数字ではありません。", entries: toEntries([...rows].sort((a, b) => b.workers - a.workers || byName(a, b)), (row) => `約${Math.round(row.workers / 10000).toLocaleString("ja-JP")}万人`) },
  ];
}

export default function RankingPage() {
  const all = incomeEntries();
  const overall = all.slice(0, 10);
  const groups = groupByCategory(all, 5);
  const genreTopLists = groupByCategory(all, 10);
  return <div className="page-shell ranking-page">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "人気職業アクセスランキング", numberOfItems: popularityRanking.length, itemListElement: popularityRanking.map((item) => ({ "@type": "ListItem", position: item.rank, name: item.name, url: item.careerSlug ? absoluteUrl(`/career/${item.careerSlug}/`) : absoluteUrl("/all/") })) }} />
    <header className="page-heading"><span className="eyebrow">公式アクセス履歴 × manapick連携</span><h1>人気職業アクセスランキング</h1><p>人気の順序はjob tagのアクセス履歴だけを使います。manapickの動画・AI・資格表示は、次に確認できる情報の有無であり、順位には一切加えていません。</p></header>
    <nav className="ranking-anchor-nav" aria-label="ランキング内メニュー">
      <a href="#popularity">人気ランキング</a>
      <a href="#income">年収ランキング</a>
      <a href="#extra">ボーナス・年齢・人数ランキング</a>
    </nav>
    <details className="ranking-method-fold"><summary><span>順位の根拠と、示さないこと</span><small>最終確認 {popularityMethod.checkedAt}</small></summary><div className="ranking-method"><div><strong>順位の根拠</strong><p>{popularityMethod.description}</p></div><div><strong>この順位が示さないこと</strong><p>{popularityMethod.limitation}</p></div><a href={popularityMethod.sourceUrl} target="_blank" rel="noopener noreferrer">公式ランキングを確認 <ArrowUpRightIcon /></a></div></details>
    <section id="popularity" aria-label="人気職業アクセスランキング">
      <PopularityRanking entries={popularityRanking} filterable />
    </section>
    <IncomeRanking overall={overall} groups={groups} genreTopLists={genreTopLists} />
    <ExtraRankings rankings={extraRankings()} />
    <NetworkSites />
  </div>;
}

function ArrowUpRightIcon() { return <span aria-hidden="true">↗</span>; }
