#!/usr/bin/env node
/**
 * manapick license との相互リンクデータを生成する。
 *
 * 1) 職業ページ（/occupation/）の関連資格リンク:
 *    公開中120職業の「関連資格」名と、license の資格データ（224件）の名称を
 *    正規化して完全一致したものだけを結ぶ。推測の対応付けはしない。
 *    正規化: 括弧内（別名・略称）を除去し、空白を除く。
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

const licenseByCoreName = new Map();
for (const license of licenses) {
  const core = normalize(license.name);
  if (!core) continue;
  if (licenseByCoreName.has(core) && licenseByCoreName.get(core) !== license.slug) {
    throw new Error(`資格名の正規化が重複しています: ${core}`);
  }
  licenseByCoreName.set(core, license.slug);
}
const licenseNameBySlug = new Map(licenses.map((l) => [l.slug, l.name]));

const occupations = {};
let occupationLinkCount = 0;
for (const occupation of catalog.occupations) {
  const id = String(occupation.catalogId);
  if (!publishedIds.has(id)) continue;
  const links = [];
  for (const name of occupation.qualifications ?? []) {
    const slug = licenseByCoreName.get(normalize(name));
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
  source: "manapick license content/licenses.json（資格224件）＋ content/income-links.json の career 対応20組",
  note: "職業ページ分は資格名の正規化完全一致のみ（推測の対応付けなし）。ドシエ分は license 側で検証済みの対応の逆引きで、資格欄にリンク済みの資格は除く。",
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
