import "./home.css";
import { careerCard } from "@/lib/career-card";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, Building2, GraduationCap } from "lucide-react";
import { categories, publishedJobs } from "@/content/jobs";
import { CareerExplorer } from "@/components/CareerExplorer";
import { CareerBriefing } from "@/components/CareerBriefing";
import { DailyCareerLoop } from "@/components/DailyCareerLoop";
import { EditorialPreview } from "@/components/EditorialPreview";
import { guides, publishedNews } from "@/content/editorial";
import { humanReviewedSlugByOccupation, occupationCatalog, occupationCatalogCategories, occupationDirectory, publishedOccupationCatalog } from "@/content/catalog";
import { HomeSearch, type HomeSearchItem } from "@/components/HomeSearch";
import profiles from "@/content/professional-careers.json";

import { ProfessionalEntries } from '@/components/ProfessionalEntries';
export default function Home(){
  const detailedLinks: Record<string, string> = {...humanReviewedSlugByOccupation, ...Object.fromEntries(profiles.items.map(item => [item.name, item.slug]))};
  const publishedIdSet = new Set(publishedOccupationCatalog.map(item => item.catalogId));
  const homeSearchItems: HomeSearchItem[] = occupationDirectory.map((occupation) => {
    const detail = detailedLinks[occupation.name];
    const hasPage = publishedIdSet.has(occupation.catalogId);
    return {
      name: occupation.name,
      aliases: occupation.aliases,
      category: occupationCatalogCategories.find(item => item.key === occupation.categoryKey)?.label ?? "",
      href: detail ? `/career/${detail}/` : hasPage ? `/occupation/${occupation.catalogId}/` : `/all/?q=${encodeURIComponent(occupation.name)}#catalog-title`,
      note: detail ? "career解説あり" : hasPage ? "個別ページあり" : "職業一覧で見る",
    };
  });
  return <>
  <section className="home-hero"><div className="home-hero-inner"><div className="home-hero-copy">
    <div className="career-search-intro"><div><span className="eyebrow">manapick career / 仕事を知る</span><h1>どんな仕事を<br className="home-heading-break"/>知りたいですか？</h1><p>{occupationCatalog.length}職業の仕事内容と年収の目安を、公式出典と確認日つきで調べられます。そのうち{publishedOccupationCatalog.length}職業は、編集部が中身を厚く書いた個別ページを用意しました。職業の違いを比べるガイドも{guides.length}本あります。</p></div><Link href="/route/" className="home-route-link">迷ったら入口案内 <ArrowRight aria-hidden="true" /></Link></div>
    <HomeSearch items={homeSearchItems} />
    <nav className="home-discovery" aria-label="職業情報の探し方"><Link href="/all/">556職業から探す <ArrowRight aria-hidden="true"/></Link><Link href="/career/tax-accountant/">税理士</Link><Link href="/career/lawyer/">弁護士</Link><Link href="/career/nurse/">看護師</Link><Link href="/career/childcare-worker/">保育士</Link><Link href="/compare/">仕事を比べる</Link><Link href="/tools/net-income/">手取りを試算する</Link><Link href="/route/#workstyle">働き方から探す</Link></nav>
  </div></div></section>
  <div className="home-profession-wrap"><ProfessionalEntries/></div>
  <CareerBriefing />
  <DailyCareerLoop latestNews={publishedNews[0]} />
  <div id="jobs" className="scroll-anchor" />
  <CareerExplorer jobs={publishedJobs.map(careerCard)} categories={categories.map(x=>({...x}))}/>
  <EditorialPreview />
  <section className="route-banner"><div><span className="eyebrow">3つの質問だけ</span><h2>キャリア候補の入口案内</h2><p>興味・取り組みたい作業・学習時間から、調べ始める候補を3つ提示します。回答はこの端末だけに保存されます。</p></div><Link className="button primary" href="/route/">入口案内を始める <ArrowRight aria-hidden="true"/></Link></section>
  <section className="network-section"><div className="section-heading"><span className="eyebrow">manapick network</span><h2>知るところから、仕事の入口まで。</h2></div><div className="network-steps">
    <a className="step blue" href="https://manapick.app/" target="_blank" rel="noopener noreferrer"><GraduationCap/><span>01</span><strong>学ぶ</strong><p>学習動画とロードマップ</p></a>
    <a className="step red" href="https://ai.manapick.app/" target="_blank" rel="noopener noreferrer"><Bot/><span>02</span><strong>AIを選ぶ</strong><p>仕事に使う具体的なAI</p></a>
    <a className="step green" href="https://license.manapick.app/" target="_blank" rel="noopener noreferrer"><BadgeCheck/><span>03</span><strong>資格で証明</strong><p>公式要件を確認して比較</p></a>
    <a className="step rose" href="https://company.manapick.app/" target="_blank" rel="noopener noreferrer"><Building2/><span>04</span><strong>企業を読む</strong><p>上場企業の事業と決算</p></a>
    <div className="step gold current"><ArrowRight/><span>05</span><strong>仕事につなぐ</strong><p>仕事内容と入口を整理</p></div>
  </div></section>
</>}
