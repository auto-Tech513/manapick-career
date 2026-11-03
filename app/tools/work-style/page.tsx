import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WorkstyleDiagnosis } from "@/components/WorkstyleDiagnosis";
import { buildWorkstyleCards } from "@/lib/workstyle-cards";
import { absoluteUrl } from "@/lib/site";

const title = "16タイプ働き方診断";
const description = "仕事場面での好みの12問から、4つの働き方の傾向と、その働き方が多い職業への入口を示します。適性や向き不向きの判定ではありません。";
export const metadata: Metadata = { title, description, alternates: { canonical: "/tools/work-style/" }, openGraph: { title, description, url: absoluteUrl("/tools/work-style/"), type: "website", siteName: "manapick career", locale: "ja_JP" }, twitter: { card: "summary", title, description } };

export default function WorkstylePage() {
  const cardsByType = buildWorkstyleCards();
  return <div className="page-shell wsd-page">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">働き方診断</span></nav>
    <header className="page-heading">
      <span className="eyebrow">work style check</span>
      <h1>16タイプ働き方診断</h1>
      <p>働き方の好みから、知らない職業に出会うための入口です。</p>
    </header>
    <WorkstyleDiagnosis cardsByType={cardsByType} />
    <section className="wsd-more-tools" aria-label="ほかの道具と入口">
      <Link href="/tools/net-income/">年収から手取りを試算する<ArrowRight aria-hidden="true" /></Link>
      <Link href="/route/">いまの関心から探す入口案内<ArrowRight aria-hidden="true" /></Link>
    </section>
  </div>;
}
