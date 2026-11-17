import type { ArticleFigures as ArticleFiguresData } from "../content/article-visuals";
import { PhraseText } from "@/components/PhraseTitle";

// 表示値の末尾の括弧書き（「50%（年間上限40万円）」の（…））は、大きい数字の下に小さく分けて出す。
// 数字ではなく文章の値（「延べ面積が500平方メートルを超えるもの」）は文字を小さめにし、文節で折る。
// 値の文字列そのものは変えない（表示の分け方だけ）。
function splitDisplay(display: string): { main: string; note: string | null } {
  const match = display.match(/^(.+?)(（[^（）]+）)$/);
  return match ? { main: match[1], note: match[2] } : { main: display, note: null };
}

export default function ArticleFigures({ data }: { data: ArticleFiguresData }) {
  return (
    <figure className="article-chart article-figures" aria-label={data.title}>
      <figcaption>
        <span className="article-chart-eyebrow">数字で見る</span>
        <strong>{data.title}</strong>
      </figcaption>
      <div className="article-figures-grid">
        {data.items.map((item) => {
          const { main, note } = splitDisplay(item.display);
          const isText = [...main].length > 10;
          return (
            <div className={`article-figure-card${isText ? " is-text" : ""}`} key={item.label}>
              <span>{item.label}</span>
              <strong className="phrase-breaks"><PhraseText text={main} /></strong>
              {note ? <small>{note}</small> : null}
            </div>
          );
        })}
      </div>
      {data.note ? <p className="article-chart-note">{data.note}</p> : null}
    </figure>
  );
}
