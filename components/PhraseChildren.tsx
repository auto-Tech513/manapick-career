import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { PhraseText } from "@/components/PhraseTitle";

/**
 * 子要素の文字列部分を文節で折れるようにする（PhraseText と同じ規則）。
 * リード文のように「文字列＋{変数}＋文字列＋<Link>」が混ざる段落用。隣り合う文字列・数値は1つにつないでから分割し、
 * リンクなどの要素はそのまま残す。親要素に .phrase-breaks を付けて使う（独立監査 2026-11-18 PC M4）。
 */
export function PhraseChildren({ children }: { children: ReactNode }) {
  const parts: ReactNode[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) parts.push(<PhraseText key={`t${parts.length}`} text={buffer.replace(/\s*\n\s*/g, "")} />);
    buffer = "";
  };
  Children.toArray(children).forEach((child) => {
    if (typeof child === "string" || typeof child === "number") {
      buffer += String(child);
      return;
    }
    flush();
    parts.push(isValidElement(child) ? child : <Fragment key={`f${parts.length}`}>{child}</Fragment>);
  });
  flush();
  return <>{parts}</>;
}
