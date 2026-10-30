import { CheckCircle2 } from "lucide-react";
import type { ArticleItems as ArticleItemsData } from "../content/article-visuals";

export default function ArticleItems({ data }: { data: ArticleItemsData }) {
  return (
    <figure className="article-chart article-items" aria-label={data.title}>
      <figcaption>
        <span className="article-chart-eyebrow">図で見る</span>
        <strong>{data.title}</strong>
      </figcaption>
      <ul className="article-items-list">
        {data.items.map((item) => (
          <li key={item.term}>
            <CheckCircle2 aria-hidden="true" />
            <span>
              <strong>{item.term}</strong>
              {item.text ? <small>{item.text}</small> : null}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
