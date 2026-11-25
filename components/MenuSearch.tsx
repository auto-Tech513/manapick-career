"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { rankMatches, SuggestPanel } from "./SuggestPanel";

type IndexItem = { n: string; a: string[]; h: string; m: string };
let cache: Promise<IndexItem[]> | null = null;
const loadIndex = () => {
  cache ??= fetch("/search-index.json").then((response) => response.json()).then((data: { items: IndexItem[] }) => data.items).catch(() => { cache = null; return []; });
  return cache;
};

/** メニュー内の検索欄。入力すると職業・ガイド・ニュース・ページの候補を出す（索引は初回フォーカス時に読み込む）。 */
export function MenuSearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IndexItem[] | null>(null);
  const [open, setOpen] = useState(false);
  const loading = useRef(false);
  const ensure = () => { if (items || loading.current) return; loading.current = true; void loadIndex().then((list) => { setItems(list); loading.current = false; }); };
  const suggestions = useMemo(() => rankMatches(items ?? [], query, (item) => item.n, (item) => item.a), [items, query]);
  const show = open && query.trim().length > 0;
  return (
    <div className="cm-search sg-wrap">
      {/* 送信の処理の中でメニューを閉じると、フォームが外れて送信が取り消される（Enter・「検索」を押しても移らなかった）。送信が始まってから閉じる */}
      <form className="cm-search-box" action="/all/#catalog-title" method="get" role="search" onSubmit={() => { window.setTimeout(onNavigate, 0); }}>
        <label className="sr-only" htmlFor="cm-search-input">職業・ガイド・ニュースを検索</label>
        <Search aria-hidden="true" />
        <input id="cm-search-input" name="q" enterKeyHint="search" autoComplete="off" value={query} placeholder="職業名・記事名で検索" onFocus={() => { ensure(); setOpen(true); }} onChange={(event) => { ensure(); setQuery(event.target.value); setOpen(true); }} onKeyDown={(event) => {
          // 候補だけを閉じる。メニューは document の keydown で閉じるため、同じ document の後続の受け手にも渡さない
          if (event.key === "Escape" && open && query) { event.stopPropagation(); event.nativeEvent.stopImmediatePropagation(); setOpen(false); }
        }} />
        <button type="submit">検索</button>
      </form>
      {show ? (
        items ? (
          <SuggestPanel
            inline
            query={query}
            total={suggestions.total}
            onClose={() => setOpen(false)}
            items={suggestions.items.map((item) => ({ key: item.h + item.n, name: item.n, href: item.h, meta: item.m, onSelect: onNavigate }))}
            emptyText={`「${query.trim()}」に一致する職業・記事は見つかりませんでした。別名や、かな表記でも試してみてください。`}
            footText={`上位${suggestions.items.length}件を表示しています。「検索」で職業の一覧から探せます。`}
          />
        ) : <p className="sg-loading" role="status">候補を読み込んでいます…</p>
      ) : null}
    </div>
  );
}
