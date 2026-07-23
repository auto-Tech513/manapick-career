import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("content/pr-links.json", "utf8"));
const editorial = fs.readFileSync("content/editorial.ts", "utf8");
const policy = fs.readFileSync("content/editorial-policy.json", "utf8");
const adScript = fs.readFileSync("components/AdSenseScript.tsx", "utf8");
const adSlot = fs.readFileSync("components/AdSlot.tsx", "utf8");
const editorialArticle = fs.readFileSync("components/EditorialArticle.tsx", "utf8");
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
if (!editorialArticle.includes("<AdSenseScript />")) failures.push("長文記事にAdSense scriptがない");
if (!layout.includes('"google-adsense-account"')) failures.push("AdSense accountメタタグがない");
for (const origin of ["https://www.googletagmanager.com", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"]) {
  if (!headers.includes(origin)) failures.push(`CSPに${origin}がない`);
}

const unexpectedAdImports = [...walk("app"), ...walk("components")]
  .filter((file) => /\.(?:tsx|ts)$/.test(file))
  .filter((file) => !file.endsWith("components/EditorialArticle.tsx") && !file.endsWith("components/AdSlot.tsx") && !file.endsWith("components/AdSenseScript.tsx"))
  .filter((file) => /(?:AdSenseScript|AdSlot)/.test(fs.readFileSync(file, "utf8")));
if (unexpectedAdImports.length) failures.push(`広告が承認外ページへ混入: ${unexpectedAdImports.join(", ")}`);

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`monetization check: PR separation OK; manual responsive AdSense ${publisher}/${slotId} is article-only`);
