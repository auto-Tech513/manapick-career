"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bot, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import type { PopularityEntry } from "@/content/popularity-ranking";

export function PopularityRanking({ entries, compact = false }: { entries: PopularityEntry[]; compact?: boolean }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const pages = Math.ceil(entries.length / perPage);
  const visible = entries.slice((page - 1) * perPage, page * perPage);
  return <div className={`ranking-list${compact ? " compact" : ""}`}>
    <ol start={(page - 1) * perPage + 1}>{visible.map((entry) => <li key={entry.rank}>
      <span className="ranking-number"><small>ACCESS</small>{entry.rank}</span>
      <div className="ranking-copy"><small>{entry.category}</small><h3>{entry.name}</h3><div className="ranking-connections" aria-label="manapick連携情報">{entry.connections.includes("動画") ? <span><GraduationCap aria-hidden="true" />動画</span> : null}{entry.connections.includes("AI") ? <span><Bot aria-hidden="true" />AI</span> : null}{entry.connections.includes("資格") ? <span><BadgeCheck aria-hidden="true" />資格</span> : null}</div></div>
      {entry.careerSlug ? <Link href={`/career/${entry.careerSlug}/`}>確認済み詳細 <ArrowUpRight aria-hidden="true" /></Link> : <Link href="/all/">名録で検索 <ArrowUpRight aria-hidden="true" /></Link>}
    </li>)}</ol>
    {!compact && pages > 1 ? <nav className="catalog-pagination" aria-label="人気職業ランキングのページ"><button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft aria-hidden="true" />前へ</button><span>{page} / {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>次へ<ChevronRight aria-hidden="true" /></button></nav> : null}
  </div>;
}
