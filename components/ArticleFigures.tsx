import type { ArticleFigures as ArticleFiguresData } from "../content/article-visuals";

export default function ArticleFigures({ data }: { data: ArticleFiguresData }) {
  return (
    <figure className="article-chart article-figures" aria-label={data.title}>
      <figcaption>
        <span className="article-chart-eyebrow">数字で見る</span>
        <strong>{data.title}</strong>
      </figcaption>
      <div className="article-figures-grid">
        {data.items.map((item) => (
          <div className="article-figure-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.display}</strong>
          </div>
        ))}
      </div>
      {data.note ? <p className="article-chart-note">{data.note}</p> : null}
    </figure>
  );
}
