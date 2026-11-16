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

// 数字の桁区切り・小数点・％でも割らない（「28万9,｜536円」「31.｜2%」対策）
const endsWithNumberish = (value: string) => /[0-9０-９][,.，．]?$/.test(value);
const startsWithNumberish = (value: string) => /^[,.，．]?[0-9０-９%％]/.test(value) || /^[%％]/.test(value);
// 短い括弧書きの途中では割らない（「（令和｜5年3月卒）」対策）。長い括弧は通常どおり。
const openParenLength = (value: string) => {
  const open = Math.max(value.lastIndexOf("（"), value.lastIndexOf("("), value.lastIndexOf("「"), value.lastIndexOf("『"));
  if (open < 0) return -1;
  const tail = value.slice(open);
  return /[）)」』]/.test(tail) ? -1 : [...tail].length;
};

function joinSegments(segments: string[]): string[] {
  const joined: string[] = [];
  for (const segment of segments) {
    const previous = joined[joined.length - 1];
    if (previous) {
      const combined = previous + segment;
      const parenOpen = openParenLength(previous);
      const shouldJoin =
        (endsWithDigit(previous) && startsWithDigit(segment)) ||
        (endsWithNumberish(previous) && startsWithNumberish(segment)) ||
        (/[0-9０-９]か$/.test(previous) && segment.startsWith("月")) ||
        (parenOpen > 0 && parenOpen + [...segment].length <= 12) ||
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
  // 数字の再結合で長くなった文節（「消費者物価2026年8月分、」）は、語と数字の境目で
  // 折れるようにする。長すぎる文節は画面幅を超えて任意位置で割れ、句読点が行頭に来るため。
  const split: string[] = [];
  for (const segment of joined) {
    const match = [...segment].length > 9 ? segment.match(/^([^0-9０-９]*[^0-9０-９,.，．%％\s(（「『])([0-9０-９].*)$/) : null;
    if (match && [...match[1]].length >= 2 && [...match[2]].length >= 3 && openParenLength(match[1]) < 0) split.push(match[1], match[2]);
    else split.push(segment);
  }
  // 最後の文節が1〜2文字だけ次の行へ落ちないよう、直前の短い文節とつなぐ（「…を｜読む」対策）
  if (split.length >= 2) {
    const last = split[split.length - 1];
    const previous = split[split.length - 2];
    if ([...last].length <= 2 && [...previous].length + [...last].length <= 12) {
      split.splice(split.length - 2, 2, previous + last);
    }
  }
  return split;
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
