"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BookOpenCheck, Bot, ChevronLeft, ChevronRight, GraduationCap, Search } from "lucide-react";
import type { CatalogCategory, CatalogOccupation } from "@/content/catalog";

const perPage = 24;

export function OccupationCatalog({ occupations, categories, detailedLinks }: {
  occupations: CatalogOccupation[];
  categories: CatalogCategory[];
  detailedLinks: Record<string, string>;
}) {
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
  const changeCategory = (value: string) => { setCategory(value); setPage(1); };
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };

  return <section className="catalog" aria-labelledby="catalog-title">
    <div className="catalog-intro">
      <div><span className="eyebrow">job tag ver.7.01 準拠</span><h2 id="catalog-title">556職業の公式名録</h2><p>職業名・別名・職業分類だけを一次データから取り込みました。本文を自動生成せず、人が確認した詳細解説とは明確に分けています。</p></div>
      <div className="catalog-quality"><BookOpenCheck aria-hidden="true" /><span><strong>薄い詳細ページを作りません</strong><small>詳細解説は出典・学び・AI・資格・編集確認が揃った職業だけ公開</small></span></div>
    </div>
    <div className="catalog-controls">
      <label className="search-box"><Search aria-hidden="true" /><span className="sr-only">職業名録を検索</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="職業名・別名で検索" /></label>
      <label><span>カテゴリ</span><select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">すべて（{occupations.length}）</option>{categories.map((item) => <option value={item.key} key={item.key}>{item.label}</option>)}</select></label>
    </div>
    <div className="catalog-summary" aria-live="polite"><strong>{filtered.length}</strong>件中 {filtered.length ? (currentPage - 1) * perPage + 1 : 0}〜{Math.min(currentPage * perPage, filtered.length)}件</div>
    <div className="catalog-grid">{visible.map((occupation) => {
      const categoryInfo = categories.find((item) => item.key === occupation.categoryKey);
      const detail = detailedLinks[occupation.name];
      return <article className="catalog-card" key={occupation.catalogId}>
        <small>{categoryInfo?.label} <span>職業分類 {occupation.classificationCode}</span></small>
        <h3>{occupation.name}</h3>
        {occupation.aliases.length ? <p><span>別名</span>{occupation.aliases.slice(0, 3).join("、")}</p> : <p className="catalog-no-alias">job tag掲載名で確認できます</p>}
        <div className="catalog-card-actions">{detail ? <Link className="catalog-detail" href={`/career/${detail}/`}><BadgeCheck aria-hidden="true" />確認済み詳細</Link> : <a href="https://shigoto.mhlw.go.jp/User/Search/Top" target="_blank" rel="noopener noreferrer">job tagで確認 <ArrowUpRight aria-hidden="true" /></a>}</div>
        <details><summary>学びにつなぐ</summary><div><a href="https://manapick.app/" target="_blank" rel="noopener noreferrer"><GraduationCap aria-hidden="true" />動画</a><a href="https://ai.manapick.app/" target="_blank" rel="noopener noreferrer"><Bot aria-hidden="true" />AI</a><a href="https://license.manapick.app/" target="_blank" rel="noopener noreferrer"><BadgeCheck aria-hidden="true" />資格</a></div></details>
      </article>;
    })}</div>
    {!visible.length ? <p className="empty">該当する職業名がありません。短い語句か別名で検索してください。</p> : null}
    {pageCount > 1 ? <nav className="catalog-pagination" aria-label="職業名録のページ"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft aria-hidden="true" />前へ</button><span>{currentPage} / {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>次へ<ChevronRight aria-hidden="true" /></button></nav> : null}
  </section>;
}
