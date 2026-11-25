"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { rankMatches, SuggestPanel } from "./SuggestPanel";

export type HomeSearchItem = {
  name: string;
  aliases: string[];
  category: string;
  href: string;
  note: string;
};

export function HomeSearch({ items }: { items: HomeSearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => rankMatches(items, query, (item) => item.name, (item) => item.aliases), [items, query]);
  const show = open && query.trim().length > 0;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open ]);

  return (
    <div className="home-search-wrap sg-wrap google-anno-skip" ref={wrapRef} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <form className="home-search" action="/all/#catalog-title" method="get" role="search">
        <label className="sr-only" htmlFor="home-job-search">職業名・別名で検索</label>
        <Search aria-hidden="true" />
        <input id="home-job-search" name="q" enterKeyHint="search" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} placeholder="例：看護師、税理士、デザイン" />
        <button type="submit">検索 <ArrowRight aria-hidden="true" /></button>
      </form>
      {show ? (
        <SuggestPanel
          query={query}
          total={suggestions.total}
          onClose={() => setOpen(false)}
          items={suggestions.items.map((item) => {
            // 職業名ではなく別名で一致したときは、どの別名に一致したかを小字で示す（CE-02、#231 から移植）
            const needle = query.trim().toLocaleLowerCase("ja");
            const matchedAlias = item.name.toLocaleLowerCase("ja").includes(needle) ? undefined : item.aliases.find((alias) => alias.toLocaleLowerCase("ja").includes(needle));
            const aliasText = matchedAlias ? ` ・ 別名「${matchedAlias}」に一致` : item.aliases.length ? ` ・ 別名：${item.aliases.slice(0, 2).join("、")}` : "";
            return { key: item.name, name: item.name, href: item.href, meta: `${item.category} ・ ${item.note}${aliasText}` };
          })}
          emptyText={`「${query.trim()}」に一致する職業は見つかりませんでした。別名や、かな表記でも試してみてください。`}
          footText={`上位${suggestions.items.length}件を表示しています。「検索」で残りも含めて一覧で確認できます。`}
        />
      ) : null}
    </div>
  );
}
