"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { PhraseText } from "./PhraseTitle";

export type GuideCardItem = {
  slug: string;
  title: string;
  category: string;
  topic: string;
  summary: string;
  readMinutes: number;
  checkedAt: string;
  freshLevel: number;
  image: string;
};

export type GuideTopic = { id: string; label: string; description: string };

function Freshness({ level, checkedAt }: { level: number; checkedAt: string }) {
  return (
    <span className="freshness" title={`出典の最終確認日 ${checkedAt}`}>
      <span className="freshness-dots" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= level ? "dot on" : "dot"} />
        ))}
      </span>
      出典確認 {checkedAt}
    </span>
  );
}

function GuideCard({ item, lead = false }: { item: GuideCardItem; lead?: boolean }) {
  return (
    <Link className={lead ? "article-card article-card-lead" : "article-card"} href={`/guide/${item.slug}/`}>
      <span className="article-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="" loading="lazy" width={800} height={420} />
      </span>
      <span className="article-card-body">
        <span className="article-card-tag">{item.category}</span>
        <h3 className="phrase-breaks">
          <PhraseText text={item.title} />
        </h3>
        <p>{item.summary}</p>
        <span className="article-card-meta">
          <Freshness level={item.freshLevel} checkedAt={item.checkedAt} />
          <span className="article-card-minutes">
            <Clock3 aria-hidden="true" />
            約{item.readMinutes}分
          </span>
          <span className="article-card-more">
            読む <ArrowRight aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export function GuideExplorer({ items, topics }: { items: GuideCardItem[]; topics: GuideTopic[] }) {
  const [topic, setTopic] = useState("all");
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.topic, (map.get(item.topic) ?? 0) + 1);
    return map;
  }, [items]);
  const filtered = useMemo(
    () => (topic === "all" ? items : items.filter((item) => item.topic === topic)),
    [items, topic],
  );
  const trend = useMemo(
    () => [...items].sort((a, b) => (a.checkedAt < b.checkedAt ? 1 : -1)).slice(0, 3),
    [items],
  );
  const trendSlugs = new Set(trend.map((item) => item.slug));
  const activeTopic = topics.find((t) => t.id === topic);

  return (
    <section className="article-explorer" aria-label="ガイド一覧">
      <div className="category-tabs article-tabs" role="group" aria-label="テーマで絞り込む">
        <button type="button" className={topic === "all" ? "active" : ""} onClick={() => setTopic("all")}>
          すべて<small>{items.length}</small>
        </button>
        {topics.map((t) => (
          <button
            type="button"
            key={t.id}
            className={topic === t.id ? "active" : ""}
            onClick={() => setTopic(t.id)}
          >
            {t.label}
            <small>{counts.get(t.id) ?? 0}</small>
          </button>
        ))}
      </div>
      <p className="article-topic-note" aria-live="polite">
        {topic === "all"
          ? `全${items.length}本のガイドを表示しています。`
          : `${activeTopic?.label}：${activeTopic?.description}（${filtered.length}本）`}
      </p>

      {topic === "all" ? (
        <div className="article-trend">
          <h2 className="article-trend-title">
            <span aria-hidden="true">🔥</span> 最近、出典を確認したガイド
          </h2>
          <div className="article-trend-grid">
            {trend.map((item) => (
              <GuideCard key={item.slug} item={item} lead />
            ))}
          </div>
        </div>
      ) : null}

      <div className="article-grid">
        {(topic === "all" ? filtered.filter((item) => !trendSlugs.has(item.slug)) : filtered).map((item) => (
          <GuideCard key={item.slug} item={item} />
        ))}
      </div>
      {filtered.length === 0 ? <p className="empty">このテーマのガイドはまだありません。</p> : null}
    </section>
  );
}
