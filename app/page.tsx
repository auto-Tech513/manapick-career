import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, CheckCircle2, GraduationCap, Search } from "lucide-react";
import { categories, publishedJobs } from "@/content/jobs";
import { CareerExplorer } from "@/components/CareerExplorer";
import { HeroCareerSlider } from "@/components/HeroCareerSlider";

export default function Home(){return <>
  <section className="home-hero"><div className="home-hero-inner">
    <div className="home-hero-copy"><span className="hero-eyebrow">manapick公式・職業情報</span><h1><span>仕事を知る。</span><mark>学ぶ道が決まる。</mark></h1><p>仕事内容・必要スキル・注意点を比べて、動画・AI・資格の学びへ。職業の順位付けや適性の断定はしません。</p>
      <div className="hero-actions"><Link className="button primary" href="#jobs"><Search aria-hidden="true" />職業を探す</Link><Link className="button secondary" href="/route/">3問で入口案内 <ArrowRight aria-hidden="true" /></Link></div>
      <div className="hero-trust"><span><CheckCircle2 aria-hidden="true" />公開済み{publishedJobs.length}職種</span><span><CheckCircle2 aria-hidden="true" />公式出典を表示</span><span><CheckCircle2 aria-hidden="true" />人が公開前確認</span></div>
    </div>
    <HeroCareerSlider jobs={publishedJobs.slice(0, 6)} />
  </div></section>
  <div id="jobs" className="scroll-anchor" />
  <CareerExplorer jobs={publishedJobs} categories={categories.map(x=>({...x}))}/>
  <section className="route-banner"><div><span className="eyebrow">3つの質問だけ</span><h2>キャリア候補の入口案内</h2><p>興味・取り組みたい作業・学習時間から、調べ始める候補を3つ提示します。回答はこの端末だけに保存されます。</p></div><Link className="button primary" href="/route/">入口案内を始める <ArrowRight aria-hidden="true"/></Link></section>
  <section className="network-section"><div className="section-heading"><span className="eyebrow">manapick network</span><h2>知るところから、仕事の入口まで。</h2></div><div className="network-steps">
    <a className="step blue" href="https://manapick.app/" target="_blank" rel="noopener noreferrer"><GraduationCap/><span>01</span><strong>学ぶ</strong><p>確認済み動画とロードマップ</p></a>
    <a className="step red" href="https://ai.manapick.app/" target="_blank" rel="noopener noreferrer"><Bot/><span>02</span><strong>AIを選ぶ</strong><p>仕事に使う具体的なAI</p></a>
    <a className="step green" href="https://license.manapick.app/" target="_blank" rel="noopener noreferrer"><BadgeCheck/><span>03</span><strong>資格で証明</strong><p>公式要件を確認して比較</p></a>
    <div className="step gold current"><ArrowRight/><span>04</span><strong>仕事につなぐ</strong><p>仕事内容と入口を整理</p></div>
  </div></section>
</>}
