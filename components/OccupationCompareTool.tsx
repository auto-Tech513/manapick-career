"use client";
import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export type OccupationCompareItem = {
  catalogId: string;
  name: string;
  aliases: string[];
  summary: string;
  income: {
    annual: string;
    classificationName: string;
    sharedCount: number;
    meanAge: string;
    workers: string;
  } | null;
  employerCount: number;
  qualifications: string[];
};

const MAX_OPTIONS_SHOWN = 60;

export function OccupationCompareTool({ items }: { items: OccupationCompareItem[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const chosen = selected
    .map((id) => items.find((item) => item.catalogId === id))
    .filter(Boolean) as OccupationCompareItem[];
  const filtered = useMemo(() => {
    const q = query.trim();
    const pool = q
      ? items.filter((item) => item.name.includes(q) || item.aliases.some((alias) => alias.includes(q)))
      : items;
    return pool.filter((item) => !selected.includes(item.catalogId));
  }, [items, query, selected]);
  const shown = filtered.slice(0, MAX_OPTIONS_SHOWN);

  function toggle(id: string) {
    setSelected((current) => {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 3
          ? [...current, id]
          : current;
      trackEvent("compare", { tool: "occupations", selected_count: next.length });
      return next;
    });
  }

  return (
    <div className="compare-tool">
      <div className="compare-picker">
        <div className="bar">
          <p className="cnt"><b>{selected.length}</b>件選択中（最大3つまで）</p>
          <div className="act" aria-label="選択中の職業">
            {chosen.map((item) => (
              <button key={item.catalogId} onClick={() => toggle(item.catalogId)} aria-pressed="true" aria-label={`${item.name}を比較から外す`}>
                {item.name}
                <X aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        {!chosen.length ? <p className="compare-none">まだ選ばれていません。下の候補から選んでください。</p> : null}
        <label className="compare-filter">
          <span>職業名で絞り込む</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例：看護師、調理師、保育"
            aria-label="比較候補を職業名で絞り込む"
          />
        </label>
        <div className="compare-options" aria-label="職業の候補">
          {shown.map((item) => (
            <button key={item.catalogId} disabled={selected.length >= 3} onClick={() => toggle(item.catalogId)} aria-pressed="false">
              {item.name}
            </button>
          ))}
          {!shown.length ? <p className="compare-none">条件に合う職業がありません。表記や別名でも探せます。</p> : null}
        </div>
        {filtered.length > MAX_OPTIONS_SHOWN ? (
          <p className="compare-limit">候補は{MAX_OPTIONS_SHOWN}件まで表示しています。名前で絞り込んでください。</p>
        ) : null}
        {selected.length >= 3 ? <p className="compare-limit">最大3つまでです。外すには上のチップをタップしてください。</p> : null}
      </div>
      {chosen.length ? (
        <>
          <div className={chosen.length >= 3 ? "cmp2-scroll is-scroll" : "cmp2-scroll"}>
            <div className="cmp2" role="table" aria-label="選択した職業の公式統計による比較" style={{ "--n": chosen.length } as CSSProperties}>
              <div className="hdr" role="row">
                <div role="columnheader">STATISTICS</div>
                {chosen.map((item) => (
                  <div role="columnheader" key={item.catalogId}>
                    <p className="nm">{item.name}</p>
                    {item.aliases.length ? <p className="tg">別名：{item.aliases.join("・")}</p> : null}
                  </div>
                ))}
              </div>
              <p className="sec2">仕事と統計</p>
              <div className="grp" role="row">
                <div role="rowheader">仕事内容</div>
                {chosen.map((item) => <div role="cell" key={item.catalogId}>{item.summary}</div>)}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">年収の目安（平均年収換算）</div>
                {chosen.map((item) => (
                  <div role="cell" key={item.catalogId}>
                    {item.income ? <span className="n">{item.income.annual}</span> : "対応する年収統計なし"}
                  </div>
                ))}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">統計分類</div>
                {chosen.map((item) => (
                  <div role="cell" key={item.catalogId}>
                    {item.income
                      ? `${item.income.classificationName}${item.income.sharedCount >= 2 ? `（${item.income.sharedCount}職業で同じ値）` : ""}`
                      : "—"}
                  </div>
                ))}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">対応分類の平均年齢</div>
                {chosen.map((item) => <div role="cell" key={item.catalogId}>{item.income ? <span className="n">{item.income.meanAge}歳</span> : "—"}</div>)}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">対応分類の推計労働者数</div>
                {chosen.map((item) => <div role="cell" key={item.catalogId}>{item.income ? <span className="n">{item.income.workers}人</span> : "—"}</div>)}
              </div>
              <p className="sec2">資格と企業例</p>
              <div className="grp" role="row">
                <div role="rowheader">関連資格</div>
                {chosen.map((item) => (
                  <div role="cell" key={item.catalogId}>
                    {item.qualifications.length ? item.qualifications.join("、") : "入職に必須の資格は示されていません"}
                  </div>
                ))}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">企業例（公式確認済み）</div>
                {chosen.map((item) => <div role="cell" key={item.catalogId}>{item.employerCount ? `${item.employerCount}件` : "未掲載"}</div>)}
              </div>
              <div className="grp" role="row">
                <div role="rowheader">詳しく見る</div>
                {chosen.map((item) => (
                  <div role="cell" key={item.catalogId}>
                    <Link href={`/occupation/${item.catalogId}/`}>個別ページ <ArrowRight /></Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="verdict" style={{ "--n": chosen.length } as CSSProperties}>
            {chosen.map((item) => (
              <div key={item.catalogId}>
                <b>{item.name}</b>
                <p>
                  {item.income
                    ? `年収の目安 ${item.income.annual}、平均年齢 ${item.income.meanAge}歳、推計労働者数 ${item.income.workers}人。いずれも統計分類「${item.income.classificationName}」の値です。`
                    : item.summary}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="empty">比較する職業を1つ以上選んでください。</p>
      )}
    </div>
  );
}
