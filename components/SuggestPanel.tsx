"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Plus } from "lucide-react";

export type SuggestItem = {
  key: string;
  name: string;
  meta?: string;
  /** 遷移先。ない場合は onSelect を呼ぶボタンになる */
  href?: string;
  onSelect?: () => void;
  /** 「追加」など、遷移ではない操作のときの表示 */
  action?: "go" | "add";
};

/** 文字列の一致順（前方一致 → 部分一致 → 別名一致）で並べる。全検索欄で共通 */
export function rankMatches<T>(items: T[], query: string, name: (item: T) => string, aliases: (item: T) => string[], limit = 8) {
  const needle = query.trim().toLocaleLowerCase("ja");
  if (!needle) return { total: 0, items: [] as T[] };
  const ranked: { item: T; rank: number }[] = [];
  for (const item of items) {
    const label = name(item).toLocaleLowerCase("ja");
    let rank = -1;
    if (label.startsWith(needle)) rank = 0;
    else if (label.includes(needle)) rank = 1;
    else if (aliases(item).some((alias) => alias.toLocaleLowerCase("ja").includes(needle))) rank = 2;
    if (rank >= 0) ranked.push({ item, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || name(a.item).localeCompare(name(b.item), "ja"));
  return { total: ranked.length, items: ranked.slice(0, limit).map((entry) => entry.item) };
}

/**
 * career 内のすべての検索欄で使う候補パネル（入力するとすぐ候補を出す）。
 * 見た目はサイト共通（白地・濃紺2pxの線・角丸・件数は黄色のチップ）。
 */
export function SuggestPanel({ query, total, items, onClose, emptyText, footText, inline = false, label = "検索候補" }: {
  query: string;
  total: number;
  items: SuggestItem[];
  onClose: () => void;
  emptyText?: string;
  footText?: string;
  inline?: boolean;
  label?: string;
}) {
  const q = query.trim();
  const ref = useRef<HTMLDivElement>(null);
  // 候補が画面の下端（スマホは下部タブ）に隠れるときは、入力欄がヘッダーの下に来る範囲で画面を送る
  useEffect(() => {
    const panel = ref.current;
    if (!panel || inline) return;
    const rect = panel.getBoundingClientRect();
    const tabbar = document.querySelector<HTMLElement>(".spbar");
    const tabTop = tabbar && getComputedStyle(tabbar).display !== "none" ? tabbar.getBoundingClientRect().top : window.innerHeight;
    const limit = Math.min(window.innerHeight, tabTop) - 12;
    if (rect.bottom <= limit) return;
    const field = panel.parentElement?.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>(".mp-header")?.getBoundingClientRect().bottom ?? 0;
    const room = field ? field.top - header - 12 : rect.bottom - limit;
    const delta = Math.min(rect.bottom - limit, room);
    if (delta > 0) window.scrollBy({ top: delta, behavior: "smooth" });
  }, [inline, items.length]);
  return (
    <div ref={ref} className={`sg-panel${inline ? " sg-panel--inline" : ""}`} role="listbox" aria-label={label}>
      <div className="sg-head">
        <span><b className="num">{total}</b>件ヒット</span>
        <button type="button" onClick={onClose}>閉じる</button>
      </div>
      {items.length ? (
        <ul>
          {items.map((item) => {
            const inner = (
              <>
                <span className="sg-text">
                  <span className="sg-name">{item.name}</span>
                  {item.meta ? <span className="sg-meta">{item.meta}</span> : null}
                </span>
                <span className="sg-go" aria-hidden="true">{item.action === "add" ? <Plus /> : <ArrowRight />}</span>
              </>
            );
            return (
              <li key={item.key} role="option" aria-selected="false">
                {item.href ? (
                  item.href.startsWith("/") && !item.href.includes("?") ? (
                    <Link href={item.href} prefetch={false} onPointerDown={(event) => event.preventDefault()} onClick={() => { item.onSelect?.(); onClose(); }}>{inner}</Link>
                  ) : (
                    <a href={item.href} onPointerDown={(event) => event.preventDefault()} onClick={() => item.onSelect?.()}>{inner}</a>
                  )
                ) : (
                  <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => { item.onSelect?.(); onClose(); }}>{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="sg-empty">{emptyText ?? `「${q}」に一致する候補は見つかりませんでした。別名や、かな表記でも試してみてください。`}</p>
      )}
      {total > items.length && footText ? <p className="sg-foot">{footText}</p> : null}
    </div>
  );
}
