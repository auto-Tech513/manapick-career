import { routeCandidate } from "@/lib/career-card";
import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import "./route.css";
import { RouteGuide } from "@/components/RouteGuide";
import { WorkstyleDiagnosis } from "@/components/WorkstyleDiagnosis";
import { buildWorkstyleCards } from "@/lib/workstyle-cards";
import { publishedJobs, categories } from "@/content/jobs";

export const metadata: Metadata = {
  title: "キャリア候補の入口案内",
  description: "興味・取り組みたい作業・学習時間の3問から候補を提示する入口案内と、仕事場面での好みの12問から働き方の傾向と職業への入口を示す16タイプ働き方診断。どちらも適性や向き不向きの判定ではありません。",
  alternates: { canonical: "/route/" },
};

export default function RoutePage() {
  const candidates = publishedJobs.map((job) => routeCandidate(job, categories.find((category) => category.key === job.category)?.label ?? "職業情報"));
  const cardsByType = buildWorkstyleCards();
  return (
    <div className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">入口案内</span>
        <h1>キャリア候補の入口案内</h1>
        <p>探し方は2つあります。いまの関心から入る3問の案内と、働き方の好みから入る12問の診断です。どちらも調べ始める候補を出すための入口で、適性や向き不向きの判定ではありません。</p>
      </div>
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
        <h2 id="interest-title">いまの関心から探す</h2>
        <p>興味、取り組みたい作業、使える学習時間だけを使い、調べ始める候補を3つ提示します。</p>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <RouteGuide jobs={candidates} />
        </div>
      </section>
      <section id="workstyle" aria-labelledby="workstyle-title" style={{ marginTop: "4.5rem", scrollMarginTop: "110px" }}>
        <h2 id="workstyle-title">働き方から探す（16タイプ働き方診断）</h2>
        <p>働き方の好みから、知らない職業に出会うための入口です。</p>
        <WorkstyleDiagnosis cardsByType={cardsByType} />
      </section>
    </div>
  );
}
