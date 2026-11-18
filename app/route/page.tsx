import { routeCandidate } from "@/lib/career-card";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import "./route.css";
import { RouteGuide } from "@/components/RouteGuide";
import { WorkstyleDiagnosis } from "@/components/WorkstyleDiagnosis";
import { buildWorkstyleCards } from "@/lib/workstyle-cards";
import { publishedJobs, categories } from "@/content/jobs";
import { PhraseText } from "@/components/PhraseTitle";

export const metadata: Metadata = {
  title: "キャリア候補の入口案内",
  description: "興味・取り組みたい作業・学習時間の3問から候補を提示する入口案内と、仕事場面での好みの12問から働き方の傾向と職業への入口を示す16タイプ働き方診断。どちらも適性や向き不向きの判定ではありません。回答は端末内にのみ保存され、外部へ送信されません。提示された候補は、職業ページで仕事内容と出典を確認してから判断できます。",
  alternates: { canonical: "/route/", types: { "application/rss+xml": "/feed.xml" } },
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
        <p className="phead-lead">探し方は2つあります。いまの関心から入る3問の案内と、働き方の好みから入る12問の診断です。どちらも調べ始める候補を出すための入口で、適性や向き不向きの判定ではありません。</p>
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
        <p>働き方の好みから、知らない職業に出会うための入口です。</p></div></div>
        <WorkstyleDiagnosis cardsByType={cardsByType} />
      </section>
      {/* 「資格から探す（開発中）・開始時期は未定」の事前登録欄は、未確定の機能の告知のため表示しない（独立監査 2026-11-18 M5）。部品 PathwayForm は残す */}
    </div>
  );
}
