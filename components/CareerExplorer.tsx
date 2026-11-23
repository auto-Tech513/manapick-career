"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { CareerCard } from "@/lib/career-card";
import { PhraseText } from "./PhraseTitle";
import { rankMatches, SuggestPanel } from "./SuggestPanel";

type Category = { key: string; label: string; description: string };

function CategoryIcon({ category }: { category: string }) {
  const stroke = "#172033";
  switch (category) {
    case "data":
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M8 32V18M16 32V10M24 32V22M32 32V14" stroke={stroke} strokeWidth="4" />
        </svg>
      );
    case "marketing":
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="12" fill="#FFD700" stroke={stroke} strokeWidth="2.2" />
          <path d="M20 8v24M8 20h24" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "creative":
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M8 30l18-18 4 4-18 18H8z" fill="#fff" stroke={stroke} strokeWidth="2.2" />
        </svg>
      );
    case "office-accounting":
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect x="8" y="6" width="24" height="28" rx="2" fill="#fff" stroke={stroke} strokeWidth="2.2" />
          <path d="M13 14h14M13 20h14M13 26h8" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "people-license":
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="15" cy="15" r="6" fill="#fff" stroke={stroke} strokeWidth="2.2" />
          <circle cx="27" cy="17" r="5" fill="#FFD700" stroke={stroke} strokeWidth="2.2" />
          <path d="M5 33c2-8 18-8 20 0M21 33c2-6 12-6 14 0" fill="none" stroke={stroke} strokeWidth="2.2" />
        </svg>
      );
    default:
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect x="5" y="8" width="30" height="20" rx="3" fill="#fff" stroke={stroke} strokeWidth="2.2" />
          <path d="M14 34h12M20 28v6" stroke={stroke} strokeWidth="2.2" />
        </svg>
      );
  }
}

/**
 * 「仕事内容まで読める職業を探す」 — category pills and a ruled list in
 * the adopted design. Filtering (category + keyword) is the existing
 * explorer behaviour; rows link to the occupation dossiers.
 */
export function CareerExplorer({ jobs, categories }: { jobs: CareerCard[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  // 検索対象：職業名・作業・スキル・入口スキル・結論・カテゴリ名と説明
  // （例示の「数字」「人を支える」はカテゴリ説明や結論に含まれるため、名前と作業だけでは0件になっていた）
  const keywordsOf = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const job of jobs) {
      const cat = categories.find((c) => c.key === job.category);
      map.set(job.slug, [...job.tasks, ...job.skills, ...job.entrySkills, ...job.conclusion, cat?.label ?? "", cat?.description ?? ""]);
    }
    return map;
  }, [jobs, categories]);
  const filtered = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (category === "all" || job.category === category) &&
          `${job.name} ${(keywordsOf.get(job.slug) ?? []).join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [jobs, query, category, keywordsOf],
  );
  const labelFor = (key: string) => categories.find((c) => c.key === key)?.label ?? "";
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => rankMatches(jobs, query, (job) => job.name, (job) => keywordsOf.get(job.slug) ?? []), [jobs, query, keywordsOf]);
  useEffect(() => {
    if (!suggestOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [suggestOpen]);
  return (
    <section className="sec sec-tight" aria-labelledby="explorer-title">
      <div className="eh">
        <div>
          <span className="code">CA-03 · JOBS</span>
          <h2 id="explorer-title" className="phrase-breaks"><PhraseText text="仕事内容まで読める職業を探す" /></h2>
        </div>
        <Link className="hd-btn more" href="/all/">
          個別ページのある職業すべて
        </Link>
      </div>
      <div className="filt-row">
        <div className="filt" role="group" aria-label="カテゴリで絞り込む">
          <button type="button" className={category === "all" ? "on" : ""} onClick={() => setCategory("all")}>
            すべて
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.key}
              className={category === c.key ? "on" : ""}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="filt-search-wrap sg-wrap" ref={wrapRef} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setSuggestOpen(false); }}>
          <label className="filt-search">
            <Search aria-hidden="true" />
            <span className="sr-only">職業を検索</span>
            <input
              value={query}
              enterKeyHint="search"
              autoComplete="off"
              onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={(e) => { if (e.key === "Escape") setSuggestOpen(false); }}
              placeholder="例：数字、デザイン、人を支える"
            />
          </label>
          {suggestOpen && query.trim() ? (
            <SuggestPanel
              query={query}
              total={suggestions.total}
              onClose={() => setSuggestOpen(false)}
              items={suggestions.items.map((job) => ({ key: job.slug, name: job.name, href: `/career/${job.slug}/`, meta: `${labelFor(job.category)}${job.qualifications.length ? ` ・ 関連資格 ${job.qualifications.length}` : ""} ・ career解説あり` }))}
              emptyText={`「${query.trim()}」に一致する職業は見つかりませんでした。556職業の一覧では、別名でも探せます。`}
              footText={`上位${suggestions.items.length}件を表示しています。残りは下の一覧で確認できます。`}
            />
          ) : null}
        </div>
      </div>
      <p className="result-count" aria-live="polite">
        {filtered.length}件を表示
      </p>
      <div className="job-list">
        {filtered.map((job) => (
          <Link key={job.slug} className="jr" href={`/career/${job.slug}/`}>
            <span className="jr-ic">
              <CategoryIcon category={job.category} />
            </span>
            <span className="jr-main">
              <b className="phrase-breaks"><PhraseText text={job.name} /></b>
              <span>
                {labelFor(job.category)}
                {job.qualifications.length ? ` ／ 関連資格 ${job.qualifications.length}` : ""}
              </span>
            </span>
            <span className="jr-ar" aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="empty">条件に合う職業がありません。検索語を短くしてみてください。</p>
      ) : null}
    </section>
  );
}
