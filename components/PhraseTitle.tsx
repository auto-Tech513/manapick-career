import { loadDefaultJapaneseParser } from "budoux";
import { Fragment } from "react";

const parser = loadDefaultJapaneseParser();

// BudouX が語の途中で割ってしまう実測パターンへの補正。
// - 数字列と英字列は境界で再結合する（「202｜6年」「第3｜9回」「IPA D｜X動向」対策）
// - 保護対象の複合語が境界をまたぐ場合は再結合する（「完全失｜業率」など）
const PROTECTED_WORDS = ["完全失業率", "有効求人倍率", "求人分析", "はたらく"];

const endsWithDigit = (value: string) => /[0-9０-９]$/.test(value);
const startsWithDigit = (value: string) => /^[0-9０-９]/.test(value);
const endsWithLatin = (value: string) => /[A-Za-z]$/.test(value);
const startsWithLatin = (value: string) => /^[A-Za-z]/.test(value);

function joinSegments(segments: string[]): string[] {
  const joined: string[] = [];
  for (const segment of segments) {
    const previous = joined[joined.length - 1];
    if (previous) {
      const combined = previous + segment;
      const shouldJoin =
        (endsWithDigit(previous) && startsWithDigit(segment)) ||
        (endsWithLatin(previous) && startsWithLatin(segment)) ||
        PROTECTED_WORDS.some(
          (word) => combined.includes(word) && !previous.includes(word) && !segment.includes(word),
        );
      if (shouldJoin) {
        joined[joined.length - 1] = combined;
        continue;
      }
    }
    joined.push(segment);
  }
  return joined;
}

/**
 * 日本語テキストを文節単位で分割し、文節の途中で改行しないよう
 * 文節間に <wbr> を挟んで返す。親要素に .phrase-breaks を付けて使う
 * （word-break: keep-all で文節内改行を防ぎ、<wbr> 位置でのみ折る）。
 */
export function PhraseText({ text }: { text: string }) {
  const segments = joinSegments(parser.parse(text));
  return (
    <>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment}
          {index < segments.length - 1 ? <wbr /> : null}
        </Fragment>
      ))}
    </>
  );
}
