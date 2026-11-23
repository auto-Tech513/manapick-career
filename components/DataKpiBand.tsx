import type { DataKpiItem } from "@/lib/data-room";

/**
 * データ室の記事の頭に置く「数字の帯」（design-extra CE-05 の .ce-kpi）。
 * 濃紺の地・数字は黄（トップの .stats と同じ色づかい）。項目は3つ（設計どおり）。
 */
export function DataKpiBand({ items, source }: { items: DataKpiItem[]; source?: string }) {
  return (
    <section className="ce-kpi" aria-label="この記事の数字">
      {items.map((item) => (
        <div key={item.label}>
          <span className="k">{item.label}</span>
          <b className="num">{item.value}{item.unit && <small>{item.unit}</small>}</b>
          {item.note && <span className="s">{item.note}</span>}
        </div>
      ))}
      {source && <p className="src2">{source}</p>}
    </section>
  );
}
