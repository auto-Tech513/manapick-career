// データ室の記事（/data/{slug}/）。中身はコンテンツ側が content/data-room.json に書く（書き方は docs/data-room.md）。
// 表示の見本（content/data-room-sample.json）は本番ビルドには入れない。
import dataRoom from "@/content/data-room.json";
import sample from "@/content/data-room-sample.json";

export type DataKpiItem = { label: string; value: string; unit?: string; note?: string };
export type DataFigureBar = { label: string; value: number; display?: string };
export type DataBlock =
  | { type: "paragraph"; text: string }
  | { type: "figure"; tag?: string; title: string; note?: string; scaleMax: number; baseline: { value: number; label: string }; bars: DataFigureBar[]; fine?: string }
  | { type: "table"; head: string[]; rows: { label: string; cells: string[] }[] }
  | { type: "note"; label?: string; text: string };
export type DataSection = { id: string; heading: string; blocks: DataBlock[] };
export type DataArticle = {
  slug: string;
  status: "draft" | "published" | "sample";
  category: string;
  title: string;
  lead: string;
  publishedAt: string;
  checkedAt: string;
  readMinutes: number;
  author: string;
  editor: string;
  kpi?: { items: DataKpiItem[]; source?: string };
  sections: DataSection[];
  sourceIds: string[];
};

const items = (dataRoom as { items: unknown[] }).items as DataArticle[];
const sampleArticle = sample as unknown as DataArticle;

/**
 * 見本を出すのは、ローカルで DATA_ROOM_SAMPLE=1 を付けてビルドしたときと、
 * Cloudflare Pages のプレビュー（本番ブランチ main 以外）のビルドだけ。本番ビルドには出力しない。
 */
const branch = process.env.CF_PAGES_BRANCH;
export const dataRoomSampleEnabled = process.env.DATA_ROOM_SAMPLE === "1" || (Boolean(branch) && branch !== "main");

/** 公開する記事（サイトマップ・索引付け対象）。status が "published" のものだけ */
export const publishedDataArticles = items.filter((item) => item.status === "published");

/** ページとして出力する記事。公開記事＋（条件を満たすときだけ）見本 */
export const renderableDataArticles: DataArticle[] = [...publishedDataArticles, ...(dataRoomSampleEnabled ? [sampleArticle] : [])];

export const dataArticleBySlug = (slug: string) => renderableDataArticles.find((item) => item.slug === slug);

/** 図の位置（0〜100%）。同じ尺度（0〜scaleMax）で長さを決める */
export const figurePercent = (value: number, scaleMax: number) => `${Math.max(0, Math.min(100, (value / scaleMax) * 100)).toFixed(2)}%`;

/** 図の右の数値の表示。display があればそのまま（"5.20" のように桁をそろえたいとき）、なければ value をそのまま */
export const figureDisplay = (bar: DataFigureBar) => bar.display ?? String(bar.value);
