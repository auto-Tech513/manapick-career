import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3] ?? "content/job-catalog.json";

if (!input) {
  console.error("Usage: node scripts/import-jobtag-catalog.mjs <job-tag-csv> [output]");
  process.exit(1);
}

const categories = {
  "01": { key: "management", label: "管理", description: "組織・事業・施設の方針と運営を担う仕事" },
  "02": { key: "research-engineering", label: "研究・技術", description: "科学・工学・情報技術を調べ、設計し、実装する仕事" },
  "03": { key: "professional-creative", label: "法務・経営・文化芸術", description: "専門知識、相談、表現、報道などを担う仕事" },
  "04": { key: "medical-health", label: "医療・看護・保健", description: "診療、看護、検査、健康支援を担う仕事" },
  "05": { key: "education-childcare", label: "保育・教育", description: "子どもの生活と学び、学校・社会教育を支える仕事" },
  "06": { key: "office", label: "事務", description: "文書、会計、調査、連絡、業務運営を支える仕事" },
  "07": { key: "sales", label: "販売・営業", description: "商品・サービスを説明し、販売や取引を担う仕事" },
  "08": { key: "welfare-care", label: "福祉・介護", description: "生活上の相談、支援、介護を担う仕事" },
  "09": { key: "service", label: "サービス", description: "生活、飲食、接客、施設利用を支える仕事" },
  "10": { key: "security", label: "警備・保安", description: "人、施設、地域の安全を守る仕事" },
  "11": { key: "agriculture", label: "農林漁業", description: "農作物、森林、水産資源の生産と管理を担う仕事" },
  "12": { key: "manufacturing", label: "製造・修理・製図", description: "製品を作り、加工し、修理・検査する仕事" },
  "13": { key: "transport", label: "配送・輸送・機械運転", description: "人や物を運び、設備や機械を運転する仕事" },
  "14": { key: "construction", label: "建設・土木・電気工事", description: "建物、道路、設備を施工・維持する仕事" },
  "15": { key: "logistics-cleaning", label: "運搬・清掃・包装・選別", description: "物流、清掃、包装、選別など現場を支える仕事" },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const bytes = fs.readFileSync(input);
const rows = parseCsv(new TextDecoder("shift_jis").decode(bytes));
const clean = (value = "") => value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
const occupations = rows.flatMap((row) => {
  const catalogId = row[1]?.trim();
  const recordNumber = row[2]?.trim();
  const name = row[3]?.trim();
  const classificationCode = row[4]?.trim();
  if (!/^\d+$/.test(catalogId ?? "") || !name || !classificationCode) return [];
  const majorCode = classificationCode.slice(0, 2);
  const category = categories[majorCode];
  if (!category) throw new Error(`Unknown classification ${classificationCode} for ${name}`);
  const aliases = [...new Set(row.slice(17, 42).map((value) => clean(value)).filter((value) => value && value !== name))];
  const organizations = [];
  for (let index = 46; index <= 64; index += 2) {
    const organizationName = clean(row[index]);
    const url = clean(row[index + 1]);
    if (organizationName) organizations.push({ name: organizationName, url: /^https?:\/\//.test(url) ? url.replace(/^http:\/\//, "https://") : "" });
  }
  const qualifications = [...new Set(row.slice(66, 101).map((value) => clean(value)).filter(Boolean))];
  return [{
    catalogId,
    recordNumber,
    name,
    aliases,
    classificationCode,
    categoryKey: category.key,
    summary: clean(row[42]),
    work: clean(row[43]),
    entry: clean(row[44]),
    conditions: clean(row[45]),
    organizations,
    qualifications,
    updatedYears: {
      record: clean(row[101]),
      classification: clean(row[102]),
      description: clean(row[103]),
    },
  }];
});

const uniqueIds = new Set(occupations.map((item) => item.catalogId));
const uniqueNames = new Set(occupations.map((item) => item.name));
if (occupations.length < 500 || uniqueIds.size !== occupations.length || uniqueNames.size !== occupations.length) {
  throw new Error(`Catalog validation failed: rows=${occupations.length}, ids=${uniqueIds.size}, names=${uniqueNames.size}`);
}

const payload = {
  source: {
    sourceId: "jilpt-jobtag-description-7-01",
    title: "職業情報データベース 解説系ダウンロードデータ ver.7.01",
    provider: "独立行政法人労働政策研究・研修機構（JILPT）",
    downloadPage: "https://shigoto.mhlw.go.jp/User/download",
    importedAt: "2026-07-13",
    datasetUpdatedAt: "2026-04-27",
    usage: "職業名・別名・職業分類・職業解説・関連団体・関連資格を構造化。利用規約第9条に基づく二次利用として、出典・版・取込日を全詳細ページに表示します。写真・動画は使用していません。",
  },
  categories: Object.entries(categories).map(([code, category]) => ({ code, ...category })),
  occupations,
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Imported ${occupations.length} occupations to ${output}`);
