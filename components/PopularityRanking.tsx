"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bot, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import type { PopularityEntry } from "@/content/popularity-ranking";

type PopularityFilter = "all" | "動画" | "AI" | "資格" | "詳細";

const FILTERS: Array<{ key: PopularityFilter; label: string; test: (entry: PopularityEntry) => boolean }> = [
  { key: "all", label: "すべて", test: () => true },
  { key: "動画", label: "動画あり", test: (entry) => entry.connections.includes("動画") },
  { key: "AI", label: "AI情報あり", test: (entry) => entry.connections.includes("AI") },
  { key: "資格", label: "資格情報あり", test: (entry) => entry.connections.includes("資格") },
  { key: "詳細", label: "解説ページあり", test: (entry) => Boolean(entry.careerSlug) },
];

export function PopularityRanking({ entries, compact = false, filterable = false }: { entries: PopularityEntry[]; compact?: boolean; filterable?: boolean }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<PopularityFilter>("all");
  const active = FILTERS.find((item) => item.key === filter) ?? FILTERS[0];
  const filtered = filterable ? entries.filter(active.test) : entries;
  const perPage = 10;
  const pages = Math.ceil(filtered.length / perPage);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  return <div className={`ranking-list${compact ? " compact" : ""}`}>
    {filterable ? <div className="ranking-filters" role="group" aria-label="人気職業ランキングの絞り込み">{FILTERS.map((item) => {
      const count = entries.filter(item.test).length;
      return <button key={item.key} type="button" aria-pressed={filter === item.key} className={filter === item.key ? "active" : undefined} onClick={() => { setFilter(item.key); setPage(1); }}>{item.label}<span>{count}</span></button>;
    })}</div> : null}
    {filterable ? <p className="ranking-live" aria-live="polite">{active.label}で絞り込み中：{filtered.length}件</p> : null}
    <ol start={visible.length ? visible[0].rank : 1}>{visible.map((entry) => <li key={entry.rank}>
      <span className="ranking-number"><small>ACCESS</small>{entry.rank}</span>
      <div className="ranking-copy"><small>{entry.category}</small><h3>{entry.name}</h3><div className="ranking-connections" aria-label="manapick連携情報">{entry.connections.includes("動画") ? <span><GraduationCap aria-hidden="true" />動画</span> : null}{entry.connections.includes("AI") ? <span><Bot aria-hidden="true" />AI</span> : null}{entry.connections.includes("資格") ? <span><BadgeCheck aria-hidden="true" />資格</span> : null}</div></div>
      {entry.careerSlug ? <Link href={`/career/${entry.careerSlug}/`}>確認済み詳細 <ArrowUpRight aria-hidden="true" /></Link> : <Link href="/all/">名録で検索 <ArrowUpRight aria-hidden="true" /></Link>}
    </li>)}</ol>
    {filtered.length === 0 ? <p className="ranking-empty">この条件に合う職業はランキング内にありません。</p> : null}
    {!compact && pages > 1 ? <nav className="catalog-pagination" aria-label="人気職業ランキングのページ"><button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft aria-hidden="true" />前へ</button><span>{page} / {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>次へ<ChevronRight aria-hidden="true" /></button></nav> : null}
  </div>;
}
