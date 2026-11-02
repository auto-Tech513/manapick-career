#!/usr/bin/env node
// manapick company の上場企業を、業種分類（東証33業種）に基づく対応表で
// career の公開職業へ振り分け、content/company-industry-links.json を生成する。
//
// 根拠と制約:
// - 対応の判断は content/company-industry-map.json にだけ存在する。このスクリプトは判断をしない。
// - 業種は一次情報（日本取引所グループ 東証上場銘柄一覧、company 側 listed.json の ind33）を使う。
// - 並び順は各社の直近決算の売上高（companies.json metrics.sales、百万円）が確認できる範囲で大きい順。
//   売上高が未確認の企業は後ろに回し、同値・未確認同士は証券コード昇順で決定的に並べる。
// - 1職業あたりの表示は10社まで。残りは company の業種別一覧ページへのリンクで案内する。
//
// 入力: <repo>/../../manapick-company/content/{listed.json, companies.json}
//   （環境変数 COMPANY_CONTENT_DIR で上書き可）
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = process.env.COMPANY_CONTENT_DIR ?? resolve(repoRoot, "../../manapick-company/content");
const CAP = 10;

const map = JSON.parse(readFileSync(resolve(repoRoot, "content/company-industry-map.json"), "utf8"));
const listed = JSON.parse(readFileSync(resolve(contentDir, "listed.json"), "utf8"));
const companies = JSON.parse(readFileSync(resolve(contentDir, "companies.json"), "utf8"));
const publication = JSON.parse(readFileSync(resolve(repoRoot, "content/occupation-publication.json"), "utf8"));
const publishedIds = new Set(publication.records.filter((r) => r.status === "published").map((r) => String(r.catalogId)));

const byCodeListed = new Map(listed.companies.map((c) => [c.code, c]));
const byCodeCompany = new Map(companies.map((c) => [c.stockCode, c]));
if (byCodeListed.size !== byCodeCompany.size || [...byCodeListed.keys()].some((code) => !byCodeCompany.has(code))) {
  console.error("listed.json と companies.json の証券コード集合が一致しません。中止します。");
  process.exit(1);
}

const salesOf = (company) => {
  const sales = company?.metrics?.sales;
  return sales && typeof sales.value === "number" ? sales.value : null;
};
const sortCompanies = (rows) =>
  rows.sort((a, b) => {
    const sa = salesOf(a.company);
    const sb = salesOf(b.company);
    if (sa !== null && sb !== null && sa !== sb) return sb - sa;
    if (sa !== null && sb === null) return -1;
    if (sa === null && sb !== null) return 1;
    return a.listed.code.localeCompare(b.listed.code);
  });
const toLink = (row) => ({
  name: row.company.name,
  code: row.listed.code,
  slug: row.company.slug,
});

// 種類株式（社債型種類株式など）は「企業」として並べる対象ではないため表示候補から除く。
// 業種の総数（industries.total）は上場銘柄一覧の件数そのままを使う。
const isDisplayable = (listedRow) => !listedRow.name.includes("種類株式");

const occupations = {};
const addToOccupation = (catalogId, groupLabel, directoryUrl, rows) => {
  if (!publishedIds.has(String(catalogId))) {
    console.error(`対応表の catalogId ${catalogId} は公開職業ではありません。中止します。`);
    process.exit(1);
  }
  const entry = (occupations[catalogId] ??= { industries: [], pool: [] });
  entry.industries.push({ name: groupLabel, total: rows.length, ...(directoryUrl ? { directoryUrl } : {}) });
  entry.pool.push(...rows.filter((row) => isDisplayable(row.listed)));
};

for (const rule of map.rules) {
  const rows = listed.companies
    .filter((c) => c.ind33Code === rule.ind33Code)
    .map((listedRow) => ({ listed: listedRow, company: byCodeCompany.get(listedRow.code) }));
  if (!rows.length) {
    console.error(`業種 ${rule.ind33} (${rule.ind33Code}) の企業が0件です。中止します。`);
    process.exit(1);
  }
  const directoryUrl = `https://company.manapick.app/directory/industry/${Number(rule.ind33Code)}/`;
  for (const catalogId of rule.catalogIds) addToOccupation(catalogId, rule.ind33, directoryUrl, rows);
}

for (const rule of map.slugRules ?? []) {
  const rows = listed.companies
    .filter((c) => {
      const company = byCodeCompany.get(c.code);
      return company.industrySlug === rule.industrySlug && (!rule.ind33 || c.ind33 === rule.ind33);
    })
    .map((listedRow) => ({ listed: listedRow, company: byCodeCompany.get(listedRow.code) }));
  if (!rows.length) {
    console.error(`事業分類 ${rule.industrySlug} の企業が0件です。中止します。`);
    process.exit(1);
  }
  for (const catalogId of rule.catalogIds) addToOccupation(catalogId, rule.label, null, rows);
}

const out = {
  schemaVersion: 1,
  generatedAt: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date()),
  source: `manapick company の公開データ（listed.json: ${listed.sourceName}、${listed.asOf}時点／companies.json）`,
  method:
    "日本取引所グループの業種分類（東証33業種）に基づく対応表 content/company-industry-map.json で、業種の中核業務になる公開職業へ振り分けた。各職業では売上高（各社の直近決算）が確認できる範囲で大きい順に最大10社を表示し、残りは company の業種別一覧へ案内する。業種分類に基づく関連表示であり、各社の採用有無を示すものではない。",
  occupations: {},
};
let linkTotal = 0;
for (const [catalogId, entry] of Object.entries(occupations)) {
  const deduped = [...new Map(entry.pool.map((row) => [row.listed.code, row])).values()];
  const companiesOut = sortCompanies(deduped).slice(0, CAP).map(toLink);
  linkTotal += companiesOut.length;
  out.occupations[catalogId] = { industries: entry.industries, companies: companiesOut };
}

const json = JSON.stringify(out, null, 2) + "\n";
if (process.argv.includes("--stdout")) {
  // 実行環境によっては、外部リポジトリの大きなファイルを読んだプロセスからの
  // ファイル書き込みが制限されるため、標準出力へ流すモードを用意する。
  process.stdout.write(json);
  console.error(`occupations: ${Object.keys(out.occupations).length}, links: ${linkTotal}`);
} else {
  writeFileSync(resolve(repoRoot, "content/company-industry-links.json"), json);
  console.log(`occupations: ${Object.keys(out.occupations).length}, links: ${linkTotal}`);
  for (const [catalogId, entry] of Object.entries(out.occupations)) {
    console.log(`  ${catalogId}: ${entry.companies.length}社 (${entry.industries.map((i) => `${i.name} ${i.total}社`).join(" / ")})`);
  }
}
