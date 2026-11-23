import type { ReactNode } from "react";
import { PhraseChildren } from "./PhraseChildren";
import Link from "next/link";
import "@/app/info.css";
import { PhraseText } from "@/components/PhraseTitle";

export function InfoPage({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return <div className="page-shell info-page">
    <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><span aria-current="page">{title}</span></nav>
    <header className="phead"><p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-INFO · {eyebrow}</p><h1 className="phrase-breaks"><PhraseText text={title} /></h1><p className="phead-lead phrase-breaks"><PhraseChildren>{lead}</PhraseChildren></p></header>
    <article className="prose">{children}</article>
  </div>;
}
