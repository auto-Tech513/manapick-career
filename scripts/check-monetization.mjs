import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("content/pr-links.json", "utf8"));
const editorial = fs.readFileSync("content/editorial.ts", "utf8");
const policy = fs.readFileSync("content/editorial-policy.json", "utf8");
const adScript = fs.readFileSync("components/AdSenseScript.tsx", "utf8");
const adSlot = fs.readFileSync("components/AdSlot.tsx", "utf8");
const editorialArticle = fs.readFileSync("components/EditorialArticle.tsx", "utf8");
const careerPage = fs.readFileSync("app/career/[slug]/page.tsx", "utf8");
const professionalCareerPage = fs.readFileSync("components/ProfessionalCareerPage.tsx", "utf8");
const occupationPage = fs.readFileSync("app/occupation/[id]/page.tsx", "utf8");
const homePage = fs.readFileSync("app/page.tsx", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const globalCss = fs.readFileSync("app/globals.css", "utf8");
const headers = fs.readFileSync("public/_headers", "utf8");
const adsTxt = fs.readFileSync("public/ads.txt", "utf8").trim();
const failures = [];

const publisher = adScript.match(/DEFAULT_CLIENT\s*=\s*"(ca-pub-\d+)"/)?.[1];
const slotPublisher = adSlot.match(/DEFAULT_CLIENT\s*=\s*"(ca-pub-\d+)"/)?.[1];
const slotId = adSlot.match(/DEFAULT_SLOT\s*=\s*"(\d+)"/)?.[1];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

if (/\b(?:EPC|報酬額|コミッション|承認率)\b/i.test(editorial)) failures.push("編集本文に収益指標が混入");
if (!policy.includes("報酬額、承認状況、EPCを掲載順に使わない")) failures.push("掲載順位の独立方針が不足");
for (const item of data.items ?? []) {
  if (!item.offerId || !item.provider || !item.url || !item.verifiedAt) failures.push(`${item.offerId ?? "unknown"}: 必須項目不足`);
  if (!item.disclosure?.includes("PR")) failures.push(`${item.offerId}: PR開示不足`);
  if (!Array.isArray(item.placements) || !item.placements.length) failures.push(`${item.offerId}: 配置範囲なし`);
  if (/\b(?:epc|commission|reward|rank)\b/i.test(JSON.stringify(item))) failures.push(`${item.offerId}: 順位付けに不要な収益指標を保存`);
}

if (!publisher || publisher !== slotPublisher) failures.push("AdSense publisher IDがscriptとslotで一致しない");
if (!publisher || adsTxt !== `google.com, ${publisher.replace("ca-", "")}, DIRECT, f08c47fec0942fa0`) failures.push("ads.txtとAdSense publisher IDが一致しない");
if (!slotId || !/^\d{10}$/.test(slotId)) failures.push("手動AdSense slot IDが10桁でない");
if (!adScript.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=")) failures.push("公式AdSense script URLがない");
if (!adScript.includes('script.async = true') || !adScript.includes('script.crossOrigin = "anonymous"')) failures.push("AdSense scriptのasync/crossorigin設定が不足");
if (!adSlot.includes('data-ad-format="auto"') || !adSlot.includes('data-full-width-responsive="true"')) failures.push("レスポンシブ広告設定がGoogle推奨形式でない");
if (!adSlot.includes('data-ad-status') || !adSlot.includes('state === "unfilled"')) failures.push("未充填判定または自社案内フォールバックがない");
if (/\.ad-slot\[data-ad-status=[^\]]+\][^{]*\{[^}]*display\s*:\s*none/is.test(globalCss)) failures.push("未充填広告を独自CSSで非表示にしている");
if (!editorialArticle.includes("index === 1 && <AdSlot")) failures.push("広告枠が本文2番目のセクション後に限定されていない");
// 配置の拡張（オーナー指示 2026-11-26：広告は減らさず、コンテンツの邪魔にならない箇所に置く）。
// 記事は最初の節の前にも1枠（タイトル・結論・要点の後、本文の流れは中断しない位置）
if (!editorialArticle.includes("index === 0 && <AdSlot") || !editorialArticle.includes("before-section-1")) failures.push("記事の先頭の広告枠が最初の節の前でない");
if (!editorialArticle.includes("<AdSenseScript />")) failures.push("長文記事にAdSense scriptがない");
// 追加の手動枠（オーナー判断 2026-11-19 14:38：デザインを壊す広告を外した分を手動枠で補う）。
// 本家の汎用レスポンシブユニット 1438236565 を fold（配信まで高さ 0・未配信なら畳む）で、記事の最後の節の後（5節以上）とトップの1か所だけに置く
const EXTRA_SLOT = "1438236565";
if (!/index === sections\.length - 1 && sections\.length >= 5 && <AdSlot slot="1438236565" fold /.test(editorialArticle)) failures.push("記事の追加広告枠が最後の節の後（5節以上の記事だけ）でない");
if ((editorialArticle.match(/<AdSlot\b/g) ?? []).length !== 3) failures.push("記事の広告枠が3つでない");
{
  const slots = (homePage.match(/<AdSlot\b/g) ?? []).length;
  if (slots !== 2) failures.push(`トップの広告枠が2つでない: ${slots}`);
  if (!homePage.includes(`<AdSlot slot="${EXTRA_SLOT}" fold placement="home-after-briefing" />`)) failures.push("トップの広告枠が指定位置・指定ユニットでない");
  // トップにもう1枠（オーナー指示 2026-11-26 で末尾に追加、2026-11-27 の配置の原則で乗り換え案内の前へ移設）
  if (!homePage.includes(`<AdSlot slot="${EXTRA_SLOT}" fold placement="home-before-transfer" />`)) failures.push("トップの広告枠（乗り換え案内の前）が指定位置・指定ユニットでない");
}
for (const [label, source] of [["職業ページ", careerPage], ["専門職ページ", professionalCareerPage]]) {
  const slots = (source.match(/<AdSlot\b/g) ?? []).length;
  if (slots !== 2) failures.push(`${label}の広告枠が2つでない: ${slots}`);
  if (!source.includes('placement="career-after-section-3"')) failures.push(`${label}の広告配置が指定位置でない`);
  // 企業例の後・次の節の前に1枠（オーナー指示 2026-11-26 で出典の後に追加、2026-11-27 の配置の原則で企業例の後へ移設）
  if (!source.includes('placement="career-after-employers"')) failures.push(`${label}の広告配置（企業例の後）が指定位置でない`);
  if (!source.includes("<AdSenseScript />")) failures.push(`${label}にAdSense scriptがない`);
}
{
  const slots = (occupationPage.match(/<AdSlot\b/g) ?? []).length;
  if (slots !== 2) failures.push(`職業個別ページの広告枠が2つでない: ${slots}`);
  if (!occupationPage.includes('placement="occupation-after-work"')) failures.push("職業個別ページの広告配置が指定位置でない");
  // 企業例・関連業種の後・編集部の確認ポイントの前に1枠（オーナー指示 2026-11-26 で出典の後に追加、2026-11-27 の配置の原則で企業例の後へ移設）
  if (!occupationPage.includes('placement="occupation-after-employers"')) failures.push("職業個別ページの広告配置（企業例の後）が指定位置でない");
  if (!occupationPage.includes("<AdSenseScript />")) failures.push("職業個別ページにAdSense scriptがない");
}
if (!layout.includes('"google-adsense-account"')) failures.push("AdSense accountメタタグがない");
for (const origin of ["https://www.googletagmanager.com", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"]) {
  if (!headers.includes(origin)) failures.push(`CSPに${origin}がない`);
}

const unexpectedAdImports = [...walk("app"), ...walk("components")]
  .filter((file) => /\.(?:tsx|ts)$/.test(file))
  .filter((file) => !file.endsWith("components/EditorialArticle.tsx") && !file.endsWith("components/AdSlot.tsx") && !file.endsWith("components/AdSenseScript.tsx") && !file.endsWith("app/career/[slug]/page.tsx") && !file.endsWith("components/ProfessionalCareerPage.tsx") && !file.endsWith("app/occupation/[id]/page.tsx") && file !== path.join("app", "page.tsx") && file !== path.join("app", "news", "page.tsx") && file !== path.join("app", "guide", "page.tsx") && file !== path.join("app", "all", "page.tsx"))
  // AdSense 自動広告のスクリプトは全ページ（app/layout.tsx）で読み込む（オーナー決定 2026-11-18 22:32）。手動の広告枠 AdSlot は従来の3か所と、
  // 2026-11-19 14:38 のオーナー判断で足したトップ（app/page.tsx）・記事の最後の節の後だけだったが、
  // 2026-11-26 のオーナー指示（減らさず、邪魔にならない箇所に置く）で、記事の最初の節の前、職業・ドシエの出典の後、
  // トップの末尾、一覧ページ（ニュース・ガイド・全職業）の末尾を承認済みの配置に追加した。
  // 2026-11-27 の配置の原則（見えない場所への配置は配置と数えない）で、末尾寄りだった枠を目に入る位置へ移設した：
  // 職業・ドシエは企業例の後、トップは乗り換え案内の前、一覧ページは一覧の前
  .filter((file) => file.endsWith("app/layout.tsx") ? /AdSlot/.test(fs.readFileSync(file, "utf8")) : /(?:AdSenseScript|AdSlot)/.test(fs.readFileSync(file, "utf8")));
if (!layout.includes("<AdSenseScript/>") && !layout.includes("<AdSenseScript />")) failures.push("全ページ用のAdSense script（layout）がない");
if (unexpectedAdImports.length) failures.push(`広告が承認外ページへ混入: ${unexpectedAdImports.join(", ")}`);

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`monetization check: PR separation OK; manual responsive AdSense ${publisher}/${slotId} slots are articles(before section 1, after section 2, +${EXTRA_SLOT} after last section)+career(after section 3, after employers)+occupation(after work, after employers)+home(${EXTRA_SLOT} after briefing and before transfer)+indexes(news/guide/all, before list) only; auto ads script on all pages`);
