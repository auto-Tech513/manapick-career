// データ室の記事（/data/{slug}/）のデータファイルを検査する。書き方は docs/data-room.md。
// 対象：content/data-room.json（コンテンツ側が書く本番用）と content/data-room-sample.json（表示の見本）
import fs from "node:fs";
import { EMPTY_DATA_ROUTE_SLUG } from "../lib/data-room-static-params.mjs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const dataRoom = read("content/data-room.json");
const sample = read("content/data-room-sample.json");
const registry = new Set(read("content/source-registry.json").map((source) => source.sourceId));
const publicDataNames = new Set(fs.existsSync("public/data") ? fs.readdirSync("public/data") : []);

const failures = [];
const warnings = [];
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function checkArticle(article, where, allowedStatuses) {
  const fail = (message) => failures.push(`${where}: ${message}`);
  if (!article || typeof article !== "object") return fail("記事がオブジェクトではありません");
  if (!SLUG.test(article.slug ?? "")) fail(`slug は半角英小文字・数字・ハイフンだけ（${article.slug}）`);
  if (article.slug === EMPTY_DATA_ROUTE_SLUG) fail("予約された slug は使えません");
  // public/data/ にある静的ファイル（occupation-briefs など）と同じ名前は、出力先がぶつかるので使えない
  if (publicDataNames.has(article.slug)) fail(`slug ${article.slug} は public/data/ の既存ファイルと同じ名前です`);
  if (!allowedStatuses.includes(article.status)) fail(`status は ${allowedStatuses.join(" / ")} のどれか（${article.status}）`);
  for (const key of ["category", "title", "lead", "author", "editor"]) if (!isText(article[key])) fail(`${key} が空です`);
  for (const key of ["publishedAt", "checkedAt"]) if (!isDate(article[key])) fail(`${key} は YYYY-MM-DD（${article[key]}）`);
  if (isDate(article.publishedAt) && isDate(article.checkedAt) && article.publishedAt > article.checkedAt) fail("checkedAt が publishedAt より前です");
  if (!Number.isInteger(article.readMinutes) || article.readMinutes < 1) fail("readMinutes は1以上の整数");

  if (article.kpi !== undefined) {
    const items = article.kpi?.items;
    if (!Array.isArray(items) || items.length !== 3) fail("kpi.items（数字の帯）は3つ（設計が3つの並びだけのため）");
    else items.forEach((item, index) => {
      if (!isText(item.label)) fail(`kpi.items[${index}].label が空です`);
      if (!isText(item.value)) fail(`kpi.items[${index}].value が空です（数値は文字列で書く。例 "1.20"）`);
    });
    if (article.kpi?.source !== undefined && !isText(article.kpi.source)) fail("kpi.source が空です");
  }

  if (!Array.isArray(article.sections) || article.sections.length === 0) fail("sections が1つもありません");
  const sectionIds = new Set();
  for (const [sectionIndex, section] of (article.sections ?? []).entries()) {
    const at = `sections[${sectionIndex}]`;
    if (!SECTION_ID.test(section.id ?? "")) fail(`${at}.id は半角英小文字・数字・ハイフンだけ（${section.id}）`);
    if (sectionIds.has(section.id)) fail(`${at}.id が重複しています（${section.id}）`);
    sectionIds.add(section.id);
    if (!isText(section.heading)) fail(`${at}.heading が空です`);
    if (!Array.isArray(section.blocks) || section.blocks.length === 0) fail(`${at}.blocks が1つもありません`);
    for (const [blockIndex, block] of (section.blocks ?? []).entries()) {
      const b = `${at}.blocks[${blockIndex}]`;
      if (block.type === "paragraph") {
        if (!isText(block.text)) fail(`${b}.text が空です`);
      } else if (block.type === "note") {
        if (!isText(block.text)) fail(`${b}.text が空です`);
        if (block.label !== undefined && !isText(block.label)) fail(`${b}.label が空です`);
      } else if (block.type === "table") {
        if (!Array.isArray(block.head) || block.head.length < 2 || !block.head.every(isText)) fail(`${b}.head は2列以上の見出し`);
        if (!Array.isArray(block.rows) || block.rows.length === 0) fail(`${b}.rows が1行もありません`);
        const labels = new Set();
        for (const [rowIndex, row] of (block.rows ?? []).entries()) {
          if (!isText(row.label)) fail(`${b}.rows[${rowIndex}].label が空です`);
          if (labels.has(row.label)) fail(`${b}.rows[${rowIndex}].label が重複しています（${row.label}）`);
          labels.add(row.label);
          if (!Array.isArray(row.cells) || row.cells.length !== (block.head?.length ?? 0) - 1) fail(`${b}.rows[${rowIndex}].cells の数は head の数−1（${block.head?.length - 1}）`);
          else if (!row.cells.every((cell) => typeof cell === "string")) fail(`${b}.rows[${rowIndex}].cells は文字列で書く（数値も "0.38" のように）`);
        }
      } else if (block.type === "figure") {
        if (!isText(block.title)) fail(`${b}.title が空です`);
        if (typeof block.scaleMax !== "number" || !(block.scaleMax > 0)) fail(`${b}.scaleMax は0より大きい数`);
        const base = block.baseline;
        if (!base || typeof base.value !== "number" || base.value < 0 || base.value > block.scaleMax) fail(`${b}.baseline.value は 0〜scaleMax の数`);
        if (!base || !isText(base.label)) fail(`${b}.baseline.label が空です（基準線の説明。例「1.0倍＝求人と求職が同じ」）`);
        else if ([...base.label].length > 14) warnings.push(`${where} ${b}.baseline.label は14文字以内を推奨（長いと軸の「0」・最大値の文字に近づく）`);
        if (!Array.isArray(block.bars) || block.bars.length === 0) fail(`${b}.bars が1本もありません`);
        const labels = new Set();
        for (const [barIndex, bar] of (block.bars ?? []).entries()) {
          if (!isText(bar.label)) fail(`${b}.bars[${barIndex}].label が空です`);
          if (labels.has(bar.label)) fail(`${b}.bars[${barIndex}].label が重複しています（${bar.label}）`);
          labels.add(bar.label);
          if (typeof bar.value !== "number" || bar.value < 0 || bar.value > block.scaleMax) fail(`${b}.bars[${barIndex}].value は 0〜scaleMax の数（${bar.value}）`);
          if (bar.display !== undefined && !isText(bar.display)) fail(`${b}.bars[${barIndex}].display が空です`);
          if (isText(bar.label) && [...bar.label].length > 4) warnings.push(`${where} ${b}.bars[${barIndex}].label「${bar.label}」は5文字以上。幅640px以下では見出しの列が64pxのため2行に折れます`);
        }
      } else {
        fail(`${b}.type は paragraph / figure / table / note のどれか（${block.type}）`);
      }
    }
  }

  if (!Array.isArray(article.sourceIds) || article.sourceIds.length === 0) fail("sourceIds が1つもありません（content/source-registry.json の sourceId）");
  for (const id of article.sourceIds ?? []) if (!registry.has(id)) fail(`sourceIds の ${id} が content/source-registry.json にありません`);

  // 公開記事に見本の言い回しが残っていないか（見本は「表示例」と書いてある）
  if (article.status === "published" && JSON.stringify(article).includes("表示例")) fail("公開記事に「表示例」が残っています");
}

if (!Array.isArray(dataRoom.items)) failures.push("content/data-room.json: items が配列ではありません");
const slugs = new Set();
for (const [index, article] of (dataRoom.items ?? []).entries()) {
  checkArticle(article, `content/data-room.json items[${index}] (${article?.slug})`, ["draft", "published"]);
  if (slugs.has(article?.slug)) failures.push(`content/data-room.json: slug ${article.slug} が重複しています`);
  slugs.add(article?.slug);
}
checkArticle(sample, "content/data-room-sample.json", ["sample"]);
if (slugs.has(sample.slug)) failures.push(`content/data-room.json: 見本と同じ slug ${sample.slug} は使えません`);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
const published = (dataRoom.items ?? []).filter((article) => article.status === "published").length;
console.log(`data room check: ${dataRoom.items.length} item(s), ${published} published, sample "${sample.slug}" OK`);
