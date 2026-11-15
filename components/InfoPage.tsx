import type { ReactNode } from "react";
import Link from "next/link";
import "@/app/info.css";

export function InfoPage({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return <div className="page-shell info-page">
    <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><span aria-current="page">{title}</span></nav>
    <header className="phead"><p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-INFO · {eyebrow}</p><h1>{title}</h1><p className="phead-lead">{lead}</p></header>
    <article className="prose">{children}</article>
  </div>;
}
