"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { PhraseText } from "./PhraseTitle";

export type NewsCardItem = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  sourcePublishedAt: string;
  publishedAt: string;
  needsRefresh: boolean;
  image: string;
};

function NewsCard({ item, lead = false }: { item: NewsCardItem; lead?: boolean }) {
  return (
    <Link className={lead ? "article-card article-card-lead" : "article-card"} href={`/news/${item.slug}/`}>
      <span className="article-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="" loading="lazy" width={800} height={420} />
        {lead ? (
          <span className="article-card-lead-badge">
            <Newspaper aria-hidden="true" />
            注目解説
          </span>
        ) : null}
      </span>
      <span className="article-card-body">
        <span className="article-card-tag">{item.kind}</span>
        {item.needsRefresh ? <span className="archive-badge">過去資料・更新確認期限超過</span> : null}
        <h3 className="phrase-breaks">
          <PhraseText text={item.title} />
        </h3>
        <p>{item.summary}</p>
        <span className="article-card-meta">
          <span className="article-card-dates">
            <CalendarDays aria-hidden="true" />
            資料公表 {item.sourcePublishedAt}
          </span>
          <span className="article-card-more">
            全文を読む <ArrowRight aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export function NewsExplorer({ items, kinds }: { items: NewsCardItem[]; kinds: string[] }) {
  const [kind, setKind] = useState("all");
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.kind, (map.get(item.kind) ?? 0) + 1);
    return map;
  }, [items]);
  const filtered = useMemo(
    () => (kind === "all" ? items : items.filter((item) => item.kind === kind)),
    [items, kind],
  );
  const [lead, ...rest] = filtered;

  return (
    <section className="article-explorer" aria-label="ニュース一覧">
      <div className="category-tabs article-tabs" role="group" aria-label="テーマで絞り込む">
        <button type="button" className={kind === "all" ? "active" : ""} onClick={() => setKind("all")}>
          すべて<small>{items.length}</small>
        </button>
        {kinds.map((k) => (
          <button type="button" key={k} className={kind === k ? "active" : ""} onClick={() => setKind(k)}>
            {k}
            <small>{counts.get(k) ?? 0}</small>
          </button>
        ))}
      </div>
      <p className="article-topic-note" aria-live="polite">
        {filtered.length}記事を表示しています。
        {kind === "賃金・労働時間" ? " 毎月公表される賃金統計の読み解きです。前の月と並べて読むと、変化の向きが見えます。" : null}
        {kind === "雇用統計" ? " 毎月公表される雇用統計の読み解きです。前の月と並べて読むと、変化の向きが見えます。" : null}
      </p>
      {lead ? (
        <div className="article-grid">
          <NewsCard item={lead} lead />
          {rest.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty">このテーマの記事はまだありません。</p>
      )}
    </section>
  );
}
