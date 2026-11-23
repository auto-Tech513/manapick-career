/**
 * /news/ の表示用の分類（オーナー決定 2026-11-18 21:44）。
 * 記事データの kind（似た名前が多く、1件だけの分類も多い）は変えずに残し、
 * 一覧の絞り込み・カードの札・パンくずでは、ここで決めた少数の分類にまとめて表示する。
 * kind は本文ハッシュ・RSS・JSON-LD（articleSection）・OG 画像で使われるため書き換えない。
 * ニュースの分類ページ（URL）は元から無いため、転送は不要。
 */
export const NEWS_TOPICS = [
  "雇用・求人",
  "賃金・物価",
  "働き方・制度",
  "学び直し・資格",
  "AI・デジタル",
  "新卒・就職",
  "白書・産業動向",
] as const;

export type NewsTopic = (typeof NEWS_TOPICS)[number];

/** 元の kind → 表示用の分類 */
const TOPIC_BY_KIND: Record<string, NewsTopic> = {
  "雇用統計": "雇用・求人",
  "雇用・労働": "雇用・求人",
  "採用動向": "雇用・求人",
  "賃金・労働時間": "賃金・物価",
  "家計・統計": "賃金・物価",
  "賃金・制度": "賃金・物価",
  "労働統計": "賃金・物価",
  "働き方": "働き方・制度",
  "労働安全": "働き方・制度",
  "両立・制度": "働き方・制度",
  "雇用・制度": "働き方・制度",
  "人材育成": "学び直し・資格",
  "キャリア形成": "学び直し・資格",
  "医療・資格": "学び直し・資格",
  "AI・DX": "AI・デジタル",
  "デジタル人材": "AI・デジタル",
  "新卒採用": "新卒・就職",
  "教育・採用": "新卒・就職",
  "働き方・白書": "白書・産業動向",
  "産業・白書": "白書・産業動向",
  "産業・統計": "白書・産業動向",
};

/** kind だけでは内容と合わない記事の個別指定（記事の中身で分類する） */
const TOPIC_BY_SLUG: Record<string, NewsTopic> = {
  // 「労働統計」のうち、雇用・研修の記事
  "labor-force-detailed-q2-2026": "雇用・求人",
  "skills-development-survey-latest": "学び直し・資格",
  // 「賃金・労働時間」のうち、労働時間・過労の記事
  "working-hours-may-2026": "働き方・制度",
  "long-working-hours-2025": "働き方・制度",
  "overwork-compensation-2025": "働き方・制度",
  // 「賃金・制度」のうち、税の制度の記事
  "income-tax-threshold-2026": "働き方・制度",
};

export function newsTopic(item: { slug: string; kind: string }): NewsTopic | string {
  return TOPIC_BY_SLUG[item.slug] ?? TOPIC_BY_KIND[item.kind] ?? item.kind;
}

/** 絞り込みチップの並び：決めた順（記事が0件の分類は出さない）、未登録の kind は末尾 */
export function orderedNewsTopics(items: { slug: string; kind: string }[]): string[] {
  const present = new Set(items.map(newsTopic));
  const known = NEWS_TOPICS.filter((topic) => present.has(topic));
  const unknown = [...present].filter((topic) => !(NEWS_TOPICS as readonly string[]).includes(topic));
  return [...known, ...unknown];
}
