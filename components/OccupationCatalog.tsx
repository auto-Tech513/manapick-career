"use client";

import { OccupationBrief } from "@/components/OccupationBrief";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, Bot, ChevronLeft, ChevronRight, GraduationCap, Search } from "lucide-react";
import type { CatalogCategory, OccupationDirectoryEntry } from "@/content/catalog";

const perPage = 24;
const occupationJobTagUrl = (recordNumber: string) => `https://shigoto.mhlw.go.jp/Occupation/Detail?occupationId=${encodeURIComponent(recordNumber)}`;

export function OccupationCatalog({ occupations, categories, detailedLinks, briefVersion }: {
  occupations: OccupationDirectoryEntry[];
  categories: CatalogCategory[];
  detailedLinks: Record<string, string>;
  briefVersion: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ja");
    return occupations.filter((occupation) => {
      const categoryMatch = category === "all" || occupation.categoryKey === category;
      const textMatch = !needle || `${occupation.name} ${occupation.aliases.join(" ")}`.toLocaleLowerCase("ja").includes(needle);
      return categoryMatch && textMatch;
    });
  }, [occupations, query, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const changeCategory = (value: string) => { setCategory(value); setPage(1); setExpandedId(null); };
  const changeQuery = (value: string) => { setQuery(value); setPage(1); setExpandedId(null); };

  return <section className="catalog" aria-labelledby="catalog-title">
    <div className="catalog-intro">
      <div><span className="eyebrow">job tag 解説系データ ver.7.01</span><h2 id="catalog-title">556職業の出典付き名録</h2><p>仕事内容の要約を読み、気になる仕事の入職条件・労働条件・関連資格をこのページで開けます。公式配布データの説明と、企業例まで調べたcareer独自の解説を区別して案内します。</p></div>
      <div className="catalog-quality"><BookOpenCheck aria-hidden="true" /><span><strong>556職業の仕事内容を、このページで読む</strong><small>仕事内容・入職の条件・働き方を確認。独自解説では、資格の活かし方と日本企業の例も読めます</small></span></div>
    </div>
    <div className="catalog-controls">
      <label className="search-box"><Search aria-hidden="true" /><span className="sr-only">職業名録を検索</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="職業名・別名で検索" /></label>
      <label><span>カテゴリ</span><select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">すべて（{occupations.length}）</option>{categories.map((item) => <option value={item.key} key={item.key}>{item.label}</option>)}</select></label>
    </div>
    <div className="catalog-summary" aria-live="polite"><strong>{filtered.length}</strong>件中 {filtered.length ? (currentPage - 1) * perPage + 1 : 0}〜{Math.min(currentPage * perPage, filtered.length)}件</div>
    <div className="catalog-grid">{visible.map((occupation) => {
      const categoryInfo = categories.find((item) => item.key === occupation.categoryKey);
      const detail = detailedLinks[occupation.name];
      return <article className={`catalog-card${expandedId === occupation.catalogId ? " is-expanded" : ""}`} key={occupation.catalogId}>
        <small>{categoryInfo?.label} <span>職業分類 {occupation.classificationCode}</span></small>
        <h3>{occupation.name}</h3><p className="catalog-work-summary">{occupation.summary}</p>
        {occupation.aliases.length ? <p><span>別名</span>{occupation.aliases.slice(0, 3).join("、")}</p> : <p className="catalog-no-alias">job tag掲載名で確認できます</p>}
        <div className="catalog-card-actions"><button type="button" className="catalog-read" aria-expanded={expandedId === occupation.catalogId} aria-controls={expandedId === occupation.catalogId ? `occupation-brief-${occupation.catalogId}` : undefined} onClick={() => setExpandedId(expandedId === occupation.catalogId ? null : occupation.catalogId)}>{expandedId === occupation.catalogId ? "説明を閉じる" : "仕事内容・入職条件・資格を読む"}</button>{detail ? <Link className="catalog-detail" href={`/career/${detail}/`}><BadgeCheck aria-hidden="true" />企業例まで読む career解説 <ArrowRight aria-hidden="true" /></Link> : <a href={occupationJobTagUrl(occupation.recordNumber)} target="_blank" rel="noopener noreferrer"><BookOpenCheck aria-hidden="true" />公式job tagで仕事内容を確認 <ArrowUpRight aria-hidden="true" /></a>}</div>
        {expandedId === occupation.catalogId ? <OccupationBrief key={occupation.catalogId} catalogId={occupation.catalogId} name={occupation.name} version={briefVersion} /> : null}
        <details><summary>学びにつなぐ</summary><div><a href="https://manapick.app/" target="_blank" rel="noopener noreferrer"><GraduationCap aria-hidden="true" />動画</a><a href="https://ai.manapick.app/" target="_blank" rel="noopener noreferrer"><Bot aria-hidden="true" />AI</a><a href="https://license.manapick.app/" target="_blank" rel="noopener noreferrer"><BadgeCheck aria-hidden="true" />資格</a></div></details>
      </article>;
    })}</div>
    {!visible.length ? <p className="empty">該当する職業名がありません。短い語句か別名で検索してください。</p> : null}
    {pageCount > 1 ? <nav className="catalog-pagination" aria-label="職業名録のページ"><button disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); setExpandedId(null); }}><ChevronLeft aria-hidden="true" />前へ</button><span>{currentPage} / {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); setExpandedId(null); }}>次へ<ChevronRight aria-hidden="true" /></button></nav> : null}
  </section>;
}
