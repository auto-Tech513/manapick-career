// ニュースの表示用の分類（lib/news-topics.ts の新7分類）を、画像生成スクリプト（.mjs）から使うための読み取り。
// 独立監査2 2026-11-19 M1：カード画像・記事カバーに旧21分類（記事データの kind）の名前が描かれ、
// 一覧の札・パンくず（新7分類）と食い違っていた。分類の対応は lib/news-topics.ts だけに置き、ここでは正規表現で読む。
// 記事データの kind は書き換えない（公開確認の検査・本文ハッシュ・JSON-LD で使われる）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = fs.readFileSync(path.join(root, "lib/news-topics.ts"), "utf8");

function block(name) {
  const start = source.indexOf(name);
  if (start < 0) throw new Error(`lib/news-topics.ts に ${name} が見つかりません`);
  const open = source.indexOf("{", source.indexOf("=", start));
  const close = source.indexOf("};", open);
  return source.slice(open, close);
}
const pairs = (text) => new Map([...text.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));

const topicsStart = source.indexOf("NEWS_TOPICS = [");
const topicsEnd = source.indexOf("]", topicsStart);
export const NEWS_TOPICS = [...source.slice(topicsStart, topicsEnd).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const byKind = pairs(block("TOPIC_BY_KIND"));
const bySlug = pairs(block("TOPIC_BY_SLUG"));
if (NEWS_TOPICS.length < 3 || byKind.size < 5) throw new Error("lib/news-topics.ts の分類を読み取れません");
for (const topic of [...byKind.values(), ...bySlug.values()]) {
  if (!NEWS_TOPICS.includes(topic)) throw new Error(`lib/news-topics.ts の対応先「${topic}」が NEWS_TOPICS にありません`);
}

/** lib/news-topics.ts の newsTopic と同じ規則（記事ごとの指定 → kind の対応 → 未登録は kind のまま） */
export function newsTopicFor(slug, kind) {
  return bySlug.get(slug) ?? byKind.get(kind) ?? kind;
}
