"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { rankMatches, SuggestPanel } from "./SuggestPanel";

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
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => rankMatches(items.filter((item) => !selected.includes(item.catalogId)), query, (item) => item.name, (item) => item.aliases), [items, query, selected]);
  useEffect(() => {
    if (!suggestOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [suggestOpen]);

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
        <div className="compare-picker-head">
          <strong>比較する職業（最大3つ）</strong>
          <span className="compare-count" aria-live="polite">{selected.length}/3 選択中</span>
        </div>
        <div className="compare-selected" aria-label="選択中の職業">
          {chosen.map((item) => (
            <button key={item.catalogId} className="selected" onClick={() => toggle(item.catalogId)} aria-pressed="true">
              {item.name}
              <X aria-hidden="true" />
            </button>
          ))}
          {!chosen.length ? <p className="compare-none">まだ選ばれていません。下の候補から選んでください。</p> : null}
        </div>
        <div className="compare-filter-wrap sg-wrap" ref={wrapRef} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setSuggestOpen(false); }}>
          <label className="compare-filter">
            <span>職業名で絞り込む</span>
            <input
              type="search"
              value={query}
              enterKeyHint="search"
              autoComplete="off"
              onChange={(event) => { setQuery(event.target.value); setSuggestOpen(true); }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={(event) => { if (event.key === "Escape") setSuggestOpen(false); }}
              placeholder="例：看護師、調理師、保育"
              aria-label="比較候補を職業名で絞り込む"
            />
          </label>
          {suggestOpen && query.trim() ? (
            <SuggestPanel
              query={query}
              total={suggestions.total}
              onClose={() => setSuggestOpen(false)}
              label="比較に追加する職業の候補"
              items={suggestions.items.map((item) => ({ key: item.catalogId, name: item.name, action: "add" as const, meta: selected.length >= 3 ? "最大3つまで選べます。上のチップで外してから追加してください" : `比較に追加${item.income ? ` ・ 年収の目安 ${item.income.annual}` : ""}`, onSelect: () => { if (selected.length < 3) { toggle(item.catalogId); setQuery(""); } } }))}
              emptyText={`「${query.trim()}」に一致する職業がありません。表記や別名でも探せます。`}
              footText={`上位${suggestions.items.length}件を表示しています。残りは下の候補ボタンから選べます。`}
            />
          ) : null}
        </div>
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
        <div className="compare-scroll" tabIndex={0} aria-label="職業の統計比較表">
          <table>
            <caption className="sr-only">選択した職業の公式統計による比較</caption>
            <thead>
              <tr>
                <th scope="col">比較項目</th>
                {chosen.map((item) => (
                  <th scope="col" key={item.catalogId}>{item.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">仕事内容</th>
                {chosen.map((item) => <td data-job={item.name} key={item.catalogId}>{item.summary}</td>)}
              </tr>
              <tr>
                <th scope="row">年収の目安（平均年収換算）</th>
                {chosen.map((item) => (
                  <td data-job={item.name} key={item.catalogId}>
                    {item.income ? <strong>{item.income.annual}</strong> : "対応する年収統計なし"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">統計分類</th>
                {chosen.map((item) => (
                  <td data-job={item.name} key={item.catalogId}>
                    {item.income
                      ? `${item.income.classificationName}${item.income.sharedCount >= 2 ? `（${item.income.sharedCount}職業で同じ値）` : ""}`
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">対応分類の平均年齢</th>
                {chosen.map((item) => <td data-job={item.name} key={item.catalogId}>{item.income ? `${item.income.meanAge}歳` : "—"}</td>)}
              </tr>
              <tr>
                <th scope="row">対応分類の推計労働者数</th>
                {chosen.map((item) => <td data-job={item.name} key={item.catalogId}>{item.income ? `${item.income.workers}人` : "—"}</td>)}
              </tr>
              <tr>
                <th scope="row">関連資格</th>
                {chosen.map((item) => (
                  <td data-job={item.name} key={item.catalogId}>
                    {item.qualifications.length ? item.qualifications.join("、") : "入職に必須の資格は示されていません"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">企業例（公式確認済み）</th>
                {chosen.map((item) => <td data-job={item.name} key={item.catalogId}>{item.employerCount ? `${item.employerCount}件` : "未掲載"}</td>)}
              </tr>
              <tr>
                <th scope="row">詳しく見る</th>
                {chosen.map((item) => (
                  <td data-job={item.name} key={item.catalogId}>
                    <Link href={`/occupation/${item.catalogId}/`}>個別ページ <ArrowRight /></Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">比較する職業を1つ以上選んでください。</p>
      )}
    </div>
  );
}
