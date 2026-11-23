"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export type HomeSearchItem = {
  name: string;
  aliases: string[];
  category: string;
  href: string;
  note: string;
};

export type HomeSearchGuide = {
  title: string;
  href: string;
  kind: "guide" | "research";
};

type Row = {
  key: string;
  href: string;
  title: string;
  matchedIn: "name" | "alias" | "title";
  alias?: string;
  category?: string;
  kind?: "guide" | "research";
};

const GROUP_LIMIT = 5;

function Marked({ text, needle }: { text: string; needle: string }) {
  const n = needle.trim().toLocaleLowerCase("ja");
  if (!n) return <>{text}</>;
  const lower = text.toLocaleLowerCase("ja");
  const parts: React.ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < text.length) {
    const j = lower.indexOf(n, i);
    if (j < 0) {
      parts.push(text.slice(i));
      break;
    }
    if (j > i) parts.push(text.slice(i, j));
    parts.push(<mark key={k++}>{text.slice(j, j + n.length)}</mark>);
    i = j + n.length;
  }
  return <>{parts}</>;
}

function IsoGlyph() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <polygon points="20,6 34,13 20,20 6,13" fill="#FFD700" stroke="#172033" strokeWidth="1.6" />
      <polygon points="6,13 20,20 20,34 6,27" fill="#fff" stroke="#172033" strokeWidth="1.6" />
      <polygon points="20,20 34,13 34,27 20,34" fill="#E8E1C9" stroke="#172033" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * CE-02 search suggestions (career design-extra): grouped results —
 * occupations by name, occupations by alias, then guides and the data
 * room — with the matched text marked, a one-line note of what matched,
 * full keyboard support and a "search everything" footer row.
 * Occupation readings (よみ) are not in the catalog data, so matching
 * covers names and aliases only.
 */
export function HomeSearch({
  items,
  guides,
}: {
  items: HomeSearchItem[];
  guides: HomeSearchGuide[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ja");
    if (!needle) return null;
    const byName: { item: HomeSearchItem; rank: number }[] = [];
    const byAlias: { item: HomeSearchItem; alias: string }[] = [];
    for (const item of items) {
      const name = item.name.toLocaleLowerCase("ja");
      if (name.startsWith(needle)) byName.push({ item, rank: 0 });
      else if (name.includes(needle)) byName.push({ item, rank: 1 });
      else {
        const alias = item.aliases.find((a) => a.toLocaleLowerCase("ja").includes(needle));
        if (alias) byAlias.push({ item, alias });
      }
    }
    byName.sort((a, b) => a.rank - b.rank || a.item.name.localeCompare(b.item.name, "ja"));
    byAlias.sort((a, b) => a.item.name.localeCompare(b.item.name, "ja"));
    const guideRows = guides
      .filter((g) => g.title.toLocaleLowerCase("ja").includes(needle))
      .slice(0, GROUP_LIMIT);
    return {
      jobs: byName.slice(0, GROUP_LIMIT),
      jobTotal: byName.length,
      aliases: byAlias.slice(0, GROUP_LIMIT),
      guides: guideRows,
    };
  }, [items, guides, query]);

  const flat: Row[] = useMemo(() => {
    if (!groups) return [];
    const rows: Row[] = [];
    for (const { item } of groups.jobs)
      rows.push({ key: `j-${item.name}`, href: item.href, title: item.name, matchedIn: "name", category: item.category });
    for (const { item, alias } of groups.aliases)
      rows.push({ key: `a-${item.name}`, href: item.href, title: item.name, matchedIn: "alias", alias });
    for (const g of groups.guides)
      rows.push({ key: `g-${g.href}`, href: g.href, title: g.title, matchedIn: "title", kind: g.kind });
    return rows;
  }, [groups]);

  const show = open && query.trim().length > 0;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open ]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!show || flat.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter" && document.activeElement === inputRef.current) {
      const row = flat[active];
      if (row) {
        event.preventDefault();
        window.location.href = row.href;
      }
    }
  };

  const needle = query.trim();
  let cursor = -1;
  const renderRow = (row: Row) => {
    cursor += 1;
    const idx = cursor;
    const isOn = idx === active;
    return (
      <li
        key={row.key}
        role="option"
        aria-selected={isOn}
        className={isOn ? "on" : undefined}
        onMouseEnter={() => setActive(idx)}
      >
        <a
          href={row.href}
          tabIndex={-1}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => setOpen(false)}
        >
          {row.matchedIn === "title" ? (
            <span className="tk">{row.kind === "research" ? "D" : row.title.slice(0, 1)}</span>
          ) : (
            <span className="ji"><IsoGlyph /></span>
          )}
          <span className="t">
            <b><Marked text={row.title} needle={needle} /></b>
            <small>
              {row.matchedIn === "alias" ? (
                <>別名「<Marked text={row.alias ?? ""} needle={needle} />」に一致</>
              ) : row.matchedIn === "title" ? (
                row.kind === "research" ? "データ室" : "ガイド"
              ) : (
                row.category
              )}
            </small>
          </span>
          <span className="ar" aria-hidden="true">→</span>
        </a>
      </li>
    );
  };

  return (
    <div
      className="home-search-wrap"
      ref={wrapRef}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form
        className={`ce-sf home-search-field${show ? " open" : ""}`}
        action="/all/#catalog-title"
        method="get"
        role="search"
      >
        <label className="vh" htmlFor="home-job-search">職業名・別名で検索</label>
        <Search size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          id="home-job-search"
          name="q"
          value={query}
          autoComplete="off"
          aria-expanded={show}
          aria-controls="home-suggest-panel"
          onChange={(event) => {
            // 入力が変わったら選択を先頭に戻す（effect の中で setState しない：react-hooks/set-state-in-effect。Cloudflare の npm run qa の lint で落ちていた）
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="例：看護師、税理士、デザイン"
        />
      </form>
      {show && groups ? (
        <div className="ce-sug" id="home-suggest-panel" role="listbox" aria-label="検索の候補">
          {groups.jobs.length ? (
            <div className="g">
              <h5>職業 <small>{groups.jobTotal}件</small></h5>
              <ul>{flat.filter((r) => r.matchedIn === "name").map(renderRow)}</ul>
            </div>
          ) : null}
          {groups.aliases.length ? (
            <div className="g">
              <h5>別名で一致</h5>
              <ul>{flat.filter((r) => r.matchedIn === "alias").map(renderRow)}</ul>
            </div>
          ) : null}
          {groups.guides.length ? (
            <div className="g">
              <h5>ガイド・データ室</h5>
              <ul>{flat.filter((r) => r.matchedIn === "title").map(renderRow)}</ul>
            </div>
          ) : null}
          {flat.length === 0 ? (
            <p className="ce-sug-empty">「{needle}」に一致する候補は見つかりませんでした。別名や、かな表記でも試してみてください。</p>
          ) : null}
          <a className="all" href={`/all/?q=${encodeURIComponent(needle)}#catalog-title`}>
            「{needle}」で全件を検索
            <span className="ar" aria-hidden="true">→</span>
          </a>
          <div className="keys" aria-hidden="true">
            <span><kbd>↑</kbd><kbd>↓</kbd>選ぶ</span>
            <span><kbd>Enter</kbd>開く</span>
            <span><kbd>Esc</kbd>閉じる</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
