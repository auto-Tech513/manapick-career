import type { CSSProperties } from "react";
import { figureDisplay, figurePercent, type DataBlock } from "@/lib/data-room";

type FigureBlock = Extract<DataBlock, { type: "figure" }>;

/**
 * データ室の記事の「図」（design-extra CE-05 の .ce-fig）。
 * 横棒・1色（濃紺）・すべての棒が同じ尺度（0〜scaleMax）。基準線を1本引く。良い悪いの色分けはしない。
 */
export function DataFigure({ figure }: { figure: FigureBlock }) {
  const base = { "--ce-fig-base": figurePercent(figure.baseline.value, figure.scaleMax) } as CSSProperties;
  return (
    <figure className="ce-fig" style={base}>
      <figcaption>
        {figure.tag && <span className="tag">{figure.tag}</span>}
        <b>{figure.title}</b>
        {figure.note && <span className="cap-note">{figure.note}</span>}
      </figcaption>
      <div className="bars">
        {figure.bars.map((bar) => (
          <div className="b" key={bar.label}>
            <span className="l">{bar.label}</span>
            <span className="tr" aria-hidden="true"><i style={{ width: figurePercent(bar.value, figure.scaleMax) }} /></span>
            <b className="num">{figureDisplay(bar)}</b>
          </div>
        ))}
      </div>
      <div className="axis"><span>0</span><span>{figure.baseline.label}</span><span>{figure.scaleMax}</span></div>
      {figure.fine && <p className="fine">{figure.fine}</p>}
    </figure>
  );
}
