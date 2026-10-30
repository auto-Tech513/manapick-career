import type { ArticleChart as ArticleChartData } from "@/content/article-charts";

// 記事本文に載っている公表値だけを横棒グラフで示す。値は本文と逐語照合済み
// （scripts/check-article-charts.mjs）。スマホではラベル・棒・値を縦積みにする。
export function ArticleChart({ chart }: { chart: ArticleChartData }) {
  const max = Math.max(...chart.bars.map((bar) => bar.value));
  return (
    <figure className="article-chart">
      <figcaption>
        <span className="article-chart-eyebrow">数字で見る</span>
        <h3>{chart.title}</h3>
      </figcaption>
      <div className="article-chart-bars">
        {chart.bars.map((bar) => (
          <div className="article-chart-row" key={bar.label}>
            <span className="article-chart-label">{bar.label}</span>
            <span className="article-chart-track" aria-hidden="true">
              <span
                className="article-chart-fill"
                style={{ width: `${Math.max(2, (bar.value / max) * 100)}%` }}
              />
            </span>
            <span className="article-chart-value">{bar.display}</span>
          </div>
        ))}
      </div>
      {chart.note && <p className="article-chart-note">{chart.note}</p>}
    </figure>
  );
}
