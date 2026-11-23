import { routeCandidate } from "@/lib/career-card";
import { PhraseChildren } from "@/components/PhraseChildren";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import "./route.css";
import { RouteGuide } from "@/components/RouteGuide";
import { WorkstyleDiagnosis } from "@/components/WorkstyleDiagnosis";
import { PathwayForm } from "@/components/PathwayForm";
import { buildWorkstyleCards } from "@/lib/workstyle-cards";
import { publishedJobs, categories } from "@/content/jobs";
import { PhraseText } from "@/components/PhraseTitle";
import { siteOpenGraph } from "@/lib/site";

export const metadata: Metadata = {
  title: "キャリア候補の入口案内",
  description: "興味・取り組みたい作業・学習時間の3問から候補を提示する入口案内と、仕事場面での好みの12問から働き方の傾向と職業への入口を示す16タイプ働き方診断。どちらも適性や向き不向きの判定ではありません。回答は端末内にのみ保存され、外部へ送信されません。提示された候補は、職業ページで仕事内容と出典を確認してから判断できます。",
  alternates: { canonical: "/route/", types: { "application/rss+xml": "/feed.xml" } }, openGraph: siteOpenGraph("/route/")
};

export default function RoutePage() {
  const candidates = publishedJobs.map((job) => routeCandidate(job, categories.find((category) => category.key === job.category)?.label ?? "職業情報"));
  const cardsByType = buildWorkstyleCards();
  return (
    <div className="page-shell">
      <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><span aria-current="page">入口案内</span></nav>
      <header className="phead">
        <p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-START · 入口案内</p>
        <h1 className="phrase-breaks"><PhraseText text="キャリア候補の入口案内" /></h1>
        <p className="phead-lead phrase-breaks"><PhraseChildren>探し方は2つあります。いまの関心から入る3問の案内と、働き方の好みから入る12問の診断です。どちらも調べ始める候補を出すための入口で、適性や向き不向きの判定ではありません。</PhraseChildren></p>
      </header>
      <nav className="route-chooser" aria-label="入口の選び方">
        <a href="#interest">
          <span className="rc-body"><span className="rc-title">関心から探す（3問）</span><span className="rc-desc">興味・取り組みたい作業・使える学習時間から、調べ始める候補を提示します</span></span>
          <ArrowDown aria-hidden="true" />
        </a>
        <a href="#workstyle">
          <span className="rc-body"><span className="rc-title">働き方から探す（12問）</span><span className="rc-desc">仕事場面での好みから16タイプの働き方の傾向と、職業への入口を示します</span></span>
          <ArrowDown aria-hidden="true" />
        </a>
        <a href="#pathway">
          <span className="rc-body"><span className="rc-title">資格から探す（事前登録）</span><span className="rc-desc">資格→職業→企業をたどる入口。公開時にメールでお知らせします</span></span>
          <ArrowDown aria-hidden="true" />
        </a>
      </nav>
      <section id="interest" aria-labelledby="interest-title" style={{ marginTop: "3rem", scrollMarginTop: "110px" }}>
        <div className="sh"><div><p className="sh-k">Q1–Q3 — 関心から</p><h2 id="interest-title" className="phrase-breaks"><PhraseText text="いまの関心から探す" /></h2>
        <p>興味、取り組みたい作業、使える学習時間だけを使い、調べ始める候補を3つ提示します。</p></div></div>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <RouteGuide jobs={candidates} />
        </div>
      </section>
      <section id="workstyle" aria-labelledby="workstyle-title" style={{ marginTop: "4.5rem", scrollMarginTop: "110px" }}>
        <div className="sh"><div><p className="sh-k">Q1–Q12 — 働き方から</p><h2 id="workstyle-title" className="phrase-breaks"><PhraseText text="働き方から探す（16タイプ働き方診断）" /></h2>
        <p className="phrase-breaks"><PhraseChildren>働き方の好みから、知らない職業に出会うための入口です。</PhraseChildren></p></div></div>
        <WorkstyleDiagnosis cardsByType={cardsByType} />
      </section>
      {/* 資格からの入口の事前登録欄。Kit フォーム 10153174 が登録を受け付けることを確認して再表示（オーナー決定 2026-11-18 21:44。「（開発中）」「開始時期は未定」の文言は出さない） */}
      <section id="pathway" aria-labelledby="pathway-title" style={{ marginTop: "4.5rem", scrollMarginTop: "110px" }}>
        <div className="sh"><div><p className="sh-k">PRE-REGISTRATION — 資格から</p><h2 id="pathway-title" className="phrase-breaks"><PhraseText text="資格から探す（事前登録）" /></h2>
        {/* 独立監査2 2026-11-19 M6：同じ説明が入口カード・節のリード・フォームの本文で3回繰り返されていた → 説明はこのリードの1回だけにする。
            PC で「役｜立ちます」と語の途中で折れていた → 文節で折る */}
        <p className="phrase-breaks"><PhraseChildren>資格を起点に、その資格で目指せる職業と、その職業に関わる上場企業までを一度にたどれる入口の事前登録です。関心のある資格を教えていただけると、どの資格から用意するかの優先順位づけに役立ちます。</PhraseChildren></p></div></div>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <PathwayForm />
        </div>
      </section>
    </div>
  );
}
