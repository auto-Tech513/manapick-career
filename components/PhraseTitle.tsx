import { loadDefaultJapaneseParser } from "budoux";
import { Fragment } from "react";

const parser = loadDefaultJapaneseParser();

/**
 * 日本語テキストを文節単位で分割し、文節の途中で改行しないよう
 * 文節間に <wbr> を挟んで返す。親要素に .phrase-breaks を付けて使う
 * （word-break: keep-all で文節内改行を防ぎ、<wbr> 位置でのみ折る）。
 */
export function PhraseText({ text }: { text: string }) {
  const segments = parser.parse(text);
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
