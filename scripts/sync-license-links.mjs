#!/usr/bin/env node
/**
 * manapick license との相互リンクデータを生成する。
 *
 * 1) 職業ページ（/occupation/）の関連資格リンク:
 *    公開中120職業の「関連資格」名と、license の資格データを対応付ける。
 *    対応付けは、すべて license 側のデータ自身から決定的に導ける形だけを使う。
 *    推測の対応付けはしない。
 *    - 正規化: 括弧内（別名・略称）を除去し、空白を除く。
 *    - 完全一致（正規化後）を最優先する。
 *    - license 側の別名候補: 名称末尾の「国家試験」「試験」「免許」を外した形と、
 *      括弧内に書かれた別名そのもの（例: ケアマネジャー（介護支援専門員））。
 *      別名候補が完全一致の名前と重なる場合や、複数の資格で取り合う場合は使わない。
 *    - 職業側の候補: 完全一致の形、「区分つき」の形（本体＋括弧内の区分。
 *      例: 危険物取扱者（丙種）→ 危険物取扱者丙種）、末尾の「修了者」を外した形
 *      （例: 介護職員初任者研修修了者 → 介護職員初任者研修）。
 *    同じ正規化名に複数の資格が一致する場合は曖昧として失敗させる。
 * 2) 職業ドシエ（/career/）の追加リンク:
 *    license 側 content/income-links.json の career 対応（20組・検証済み）を逆引きし、
 *    ドシエの資格欄ですでにリンク済みの資格を除いた分を補う。
 *
 * 入力: license リポジトリの content/（LICENSE_CONTENT_DIR、既定は相対配置）
 *       + 自リポジトリの content/job-catalog.json / occupation-publication.json
 *       / career-dossiers.json
 * 出力: content/license-links.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const licenseContentDir =
  process.env.LICENSE_CONTENT_DIR ?? resolve(repoRoot, "../../manapick-license-repo/content");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const licenses = readJson(resolve(licenseContentDir, "licenses.json"));
const incomeLinks = readJson(resolve(licenseContentDir, "income-links.json"));
const catalog = readJson(resolve(repoRoot, "content/job-catalog.json"));
const publication = readJson(resolve(repoRoot, "content/occupation-publication.json"));
const dossiers = readJson(resolve(repoRoot, "content/career-dossiers.json")).items;

const publishedIds = new Set(
  publication.records.filter((r) => r.status === "published").map((r) => String(r.catalogId)),
);

const normalize = (name) =>
  (name ?? "").replace(/[（(].*?[)）]/g, "").replace(/[\s　]/g, "").trim();

const parenContent = (name) => {
  const match = (name ?? "").match(/[（(](.*?)[)）]/);
  return match ? match[1].replace(/[\s　]/g, "").trim() : "";
};

const stripExamSuffix = (core) => {
  for (const suffix of ["国家試験", "試験", "免許"]) {
    if (core.length > suffix.length && core.endsWith(suffix)) {
      return core.slice(0, -suffix.length);
    }
  }
  return "";
};

// 完全一致の索引（重複は曖昧として失敗させる）
const licenseByCoreName = new Map();
for (const license of licenses) {
  const core = normalize(license.name);
  if (!core) continue;
  if (licenseByCoreName.has(core) && licenseByCoreName.get(core) !== license.slug) {
    throw new Error(`資格名の正規化が重複しています: ${core}`);
  }
  licenseByCoreName.set(core, license.slug);
}

// 別名の索引（完全一致と重なるもの・複数の資格で取り合うものは使わない）
const licenseByAlias = new Map();
const aliasConflicts = new Set();
for (const license of licenses) {
  const core = normalize(license.name);
  const aliases = new Set();
  const stripped = stripExamSuffix(core);
  if (stripped && stripped !== core) aliases.add(stripped);
  const paren = parenContent(license.name);
  if (paren && paren !== core) aliases.add(paren);
  for (const alias of aliases) {
    if (licenseByCoreName.has(alias)) continue;
    if (licenseByAlias.has(alias) && licenseByAlias.get(alias) !== license.slug) {
      aliasConflicts.add(alias);
      continue;
    }
    licenseByAlias.set(alias, license.slug);
  }
}
for (const alias of aliasConflicts) licenseByAlias.delete(alias);

const licenseNameBySlug = new Map(licenses.map((l) => [l.slug, l.name]));

const findLicenseSlug = (qualificationName) => {
  const core = normalize(qualificationName);
  const candidates = [core];
  const paren = parenContent(qualificationName);
  if (paren) candidates.push(core + paren);
  if (core.endsWith("修了者")) candidates.push(core.slice(0, -"修了者".length));
  for (const candidate of candidates) {
    if (licenseByCoreName.has(candidate)) return licenseByCoreName.get(candidate);
  }
  for (const candidate of candidates) {
    if (licenseByAlias.has(candidate)) return licenseByAlias.get(candidate);
  }
  return undefined;
};

const occupations = {};
let occupationLinkCount = 0;
for (const occupation of catalog.occupations) {
  const id = String(occupation.catalogId);
  if (!publishedIds.has(id)) continue;
  const links = [];
  for (const name of occupation.qualifications ?? []) {
    const slug = findLicenseSlug(name);
    if (slug) links.push({ name, slug });
  }
  if (links.length) {
    occupations[id] = links;
    occupationLinkCount += links.length;
  }
}

const dossierBySlug = new Map(dossiers.map((d) => [d.slug, d]));
const dossierExtra = {};
let dossierLinkCount = 0;
for (const [licenseSlug, pair] of Object.entries(incomeLinks.career ?? {})) {
  const dossier = dossierBySlug.get(pair.careerSlug);
  if (!dossier) throw new Error(`income-links の対応先ドシエがありません: ${pair.careerSlug}`);
  if (!licenseNameBySlug.has(licenseSlug)) throw new Error(`資格データにない slug: ${licenseSlug}`);
  const alreadyLinked = new Set(
    (dossier.qualifications ?? []).map((q) => q.licensePath).filter(Boolean),
  );
  if (alreadyLinked.has(`/license/${licenseSlug}/`)) continue;
  (dossierExtra[pair.careerSlug] ??= []).push({
    slug: licenseSlug,
    name: licenseNameBySlug.get(licenseSlug),
  });
  dossierLinkCount += 1;
}

const generatedAt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
const output = {
  source: `manapick license content/licenses.json（資格${licenses.length}件）＋ content/income-links.json の career 対応20組`,
  note: "職業ページ分は、資格名の正規化完全一致を最優先し、一致しない場合は license 側の名称から決定的に導ける別名（末尾の国家試験・試験・免許を外した形、括弧内の別名）と、職業側の区分つき・修了者を外した形だけで対応付ける（推測の対応付けなし）。ドシエ分は license 側で検証済みの対応の逆引きで、資格欄にリンク済みの資格は除く。",
  generatedAt,
  occupations,
  dossierExtra,
};

if (process.argv.includes("--stdout")) {
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
} else {
  writeFileSync(resolve(repoRoot, "content/license-links.json"), JSON.stringify(output, null, 2) + "\n");
}
console.error(
  `occupations: ${Object.keys(occupations).length}, links: ${occupationLinkCount}; dossiers: ${Object.keys(dossierExtra).length}, extra links: ${dossierLinkCount}`,
);
