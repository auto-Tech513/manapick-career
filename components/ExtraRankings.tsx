export type ExtraRankEntry = {
  classificationName: string;
  value: string;
  examples: string[];
  occupationCount: number;
};

export type ExtraRanking = {
  id: string;
  title: string;
  note: string;
  entries: ExtraRankEntry[];
};

export function ExtraRankings({ rankings }: { rankings: ExtraRanking[] }) {
  return <section aria-labelledby="extra-rank-title" className="income-rank-section" id="extra">
    <header className="page-heading"><span className="eyebrow">賃金構造基本統計調査 2025年 × 公式対応表</span><h2 id="extra-rank-title">数字で見る、いろいろランキング</h2>
      <p>年収以外の数字でも並べ替えました。単位は年収ランキングと同じ「統計分類」です（1分類を1行とし、その分類に結ばれた職業名を例として併記します）。分類の値なので、同じ分類の職業は同じ値になります。いずれも2025年6月の調査に基づく分類の平均・推計で、個人の実績や求人の条件ではありません。</p></header>
    <div className="extra-rank-groups">{rankings.map((ranking) => <section key={ranking.id} aria-label={ranking.title} className="extra-rank-group">
      <h3>{ranking.title}</h3>
      <p className="extra-rank-note">{ranking.note}</p>
      <ol className="extra-rank-list">{ranking.entries.map((entry, index) => <li key={entry.classificationName}>
        <span className="ranking-number"><small>RANK</small>{index + 1}</span>
        <div className="ranking-copy"><h4>{entry.classificationName}</h4><small>職業例：{entry.examples.join("、")}{entry.occupationCount > entry.examples.length ? ` ほか${entry.occupationCount - entry.examples.length}件` : ""}</small></div>
        <strong className="income-rank-value">{entry.value}</strong>
      </li>)}</ol>
    </section>)}</div>
  </section>;
}
