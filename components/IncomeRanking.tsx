"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type IncomeRankEntry = {
  catalogId: string;
  name: string;
  annualizedMeanYen: number;
  classificationName: string;
};
export type IncomeRankGroup = {
  key: string;
  label: string;
  entries: IncomeRankEntry[];
};

function yen(value: number) {
  return `${Math.round(value / 10000).toLocaleString("ja-JP")}万円`;
}

function RankList({ entries, start = 1 }: { entries: IncomeRankEntry[]; start?: number }) {
  return <ol start={start} className="income-rank-list">{entries.map((entry, index) => <li key={entry.catalogId}>
    <span className="ranking-number"><small>RANK</small>{start + index}</span>
    <div className="ranking-copy"><h3>{entry.name}</h3><small>統計分類：{entry.classificationName}</small></div>
    <strong className="income-rank-value">{yen(entry.annualizedMeanYen)}</strong>
    <Link href="/all/">名録で見る <ArrowUpRight aria-hidden="true" /></Link>
  </li>)}</ol>;
}

export function IncomeRanking({ overall, groups, genreTopLists }: { overall: IncomeRankEntry[]; groups: IncomeRankGroup[]; genreTopLists: IncomeRankGroup[] }) {
  const [genre, setGenre] = useState<string>("all");
  const selected = genre === "all" ? undefined : genreTopLists.find((group) => group.key === genre);
  const headlineEntries = selected ? selected.entries : overall;
  return <>
    <section aria-labelledby="income-rank-title" className="income-rank-section" id="income">
      <header className="page-heading"><span className="eyebrow">賃金構造基本統計調査 2025年 × 公式対応表</span><h2 id="income-rank-title">年収ランキング（統計分類の平均年収換算）</h2>
        <p>各職業に公式対応表（job tag 職業分類対応表）で結ばれた職種分類の「平均年収換算」を並べたものです。職業そのものの年収ではなく、同じ分類に結ばれた職業は同額になります。換算式は 2025年6月の「きまって支給する現金給与額」×12＋年間賞与その他特別給与額です。税・社会保険料控除前の金額で、手取りや初任給、求人の提示額ではありません。手取りの目安は<Link href="/tools/net-income/">手取りシミュレーター</Link>で試算できます。</p></header>
      <div className="ranking-filters" role="group" aria-label="年収ランキングのジャンル絞り込み">
        <button type="button" aria-pressed={genre === "all"} className={genre === "all" ? "active" : undefined} onClick={() => setGenre("all")}>全体</button>
        {genreTopLists.map((group) => <button key={group.key} type="button" aria-pressed={genre === group.key} className={genre === group.key ? "active" : undefined} onClick={() => setGenre(group.key)}>{group.label}</button>)}
      </div>
      <h3 className="income-rank-subtitle">{selected ? `${selected.label} トップ${selected.entries.length}` : "全体トップ10"}</h3>
      <div className="ranking-list"><RankList entries={headlineEntries} /></div>
      {selected ? <p className="ranking-note">「{selected.label}」のジャンルで絞り込んで表示しています（年収が確認できる職業が10件未満のジャンルは、全件が表示されます）。下の「ジャンル別 年収ランキング」は各ジャンルの上位5件の一覧です。</p> : null}
    </section>
    <section aria-labelledby="income-rank-genre-title" className="income-rank-section">
      <header className="page-heading"><h2 id="income-rank-genre-title">ジャンル別 年収ランキング</h2>
        <p>ジャンル（職業カテゴリ）ごとに、統計分類の平均年収換算が高い順に5件まで表示します。年収が確認できない職業は含みません。</p></header>
      <div className="income-rank-groups">{groups.map(group => <section key={group.key} aria-label={`${group.label}の年収ランキング`} className="income-rank-group">
        <h3>{group.label}</h3>
        <div className="ranking-list"><RankList entries={group.entries} /></div>
      </section>)}</div>
    </section>
  </>;
}
