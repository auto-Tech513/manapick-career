"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

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
  const suggestions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ja");
    if (!needle) return { total: 0, items: [] as HomeSearchItem[] };
    const ranked: { item: HomeSearchItem; rank: number }[] = [];
    for (const item of items) {
      const name = item.name.toLocaleLowerCase("ja");
      let rank = -1;
      if (name.startsWith(needle)) rank = 0;
      else if (name.includes(needle)) rank = 1;
      else if (item.aliases.some((alias) => alias.toLocaleLowerCase("ja").includes(needle))) rank = 2;
      if (rank >= 0) ranked.push({ item, rank });
    }
    ranked.sort((a, b) => a.rank - b.rank || a.item.name.localeCompare(b.item.name, "ja"));
    return { total: ranked.length, items: ranked.slice(0, 8).map((entry) => entry.item) };
  }, [items, query]);
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
    <div className="home-search-wrap" ref={wrapRef} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <form className="home-search" action="/all/#catalog-title" method="get" role="search">
        <label className="sr-only" htmlFor="home-job-search">職業名・別名で検索</label>
        <Search aria-hidden="true" />
        <input id="home-job-search" name="q" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} placeholder="例：看護師、税理士、デザイン" />
        <button type="submit">検索 <ArrowRight aria-hidden="true" /></button>
      </form>
      {show ? (
        <div className="home-suggest-panel" role="listbox" aria-label="検索候補">
          <div className="home-suggest-head"><span>{suggestions.total}件ヒット</span><button type="button" onClick={() => setOpen(false)}>閉じる</button></div>
          {suggestions.items.length ? (
            <ul>{suggestions.items.map((item) => (
              <li key={item.name} role="option" aria-selected="false">
                <a href={item.href} onPointerDown={(event) => event.preventDefault()}>
                  <span className="home-suggest-name">{item.name}</span>
                  <span className="home-suggest-meta">{item.category} ・ {item.note}{item.aliases.length ? ` ・ 別名：${item.aliases.slice(0, 2).join("、")}` : ""}</span>
                </a>
              </li>
            ))}</ul>
          ) : (
            <p className="home-suggest-empty">「{query.trim()}」に一致する職業は見つかりませんでした。別名や、かな表記でも試してみてください。</p>
          )}
          {suggestions.total > suggestions.items.length ? <p className="home-suggest-foot">上位{suggestions.items.length}件を表示しています。「検索」で残りも含めて一覧で確認できます。</p> : null}
        </div>
      ) : null}
    </div>
  );
}
