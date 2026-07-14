import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  GraduationCap,
  LibraryBig,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import {
  catalogCategory,
  catalogOccupation,
  humanReviewedSlugByOccupation,
  occupationCatalog,
  occupationCatalogSource,
  occupationJobTagUrl,
} from "@/content/catalog";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return occupationCatalog.map((occupation) => ({ id: occupation.catalogId }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const occupation = catalogOccupation(id);
  if (!occupation) return {};
  const title = `${occupation.name}とは？仕事内容・就くには・働く条件`;
  const description = `${occupation.summary} job tag解説系データver.7.01を出典付きで構造化し、入口・関連資格・学びへの導線を整理。`;
  return {
    title,
    description,
    alternates: { canonical: `/occupation/${id}/` },
    openGraph: { title, description, type: "article", url: absoluteUrl(`/occupation/${id}/`) },
    twitter: { card: "summary", title, description },
  };
}

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>;
}

export default async function OccupationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const occupation = catalogOccupation(id);
  if (!occupation) notFound();
  const index = occupationCatalog.findIndex((item) => item.catalogId === id);
  const previous = index > 0 ? occupationCatalog[index - 1] : null;
  const next = index < occupationCatalog.length - 1 ? occupationCatalog[index + 1] : null;
  const category = catalogCategory(occupation.categoryKey);
  const reviewedSlug = humanReviewedSlugByOccupation[occupation.name];
  const url = absoluteUrl(`/occupation/${id}/`);
  const sourceUrl = occupationJobTagUrl(occupation.recordNumber);
  const aiSearch = `https://ai.manapick.app/search/?q=${encodeURIComponent(occupation.name)}&utm_source=career&utm_medium=referral&utm_campaign=occupation_detail`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Occupation",
        name: occupation.name,
        description: occupation.summary,
        url,
        mainEntityOfPage: url,
        occupationLocation: { "@type": "Country", name: "日本" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "556職業名録", item: absoluteUrl("/all/") },
          { "@type": "ListItem", position: 3, name: occupation.name, item: url },
        ],
      },
    ],
  };

  return <><JsonLd data={graph}/><div className="page-shell occupation-detail-page">
    <nav className="article-breadcrumbs" aria-label="パンくずリスト"><Link href="/">ホーム</Link><span>/</span><Link href="/all/">556職業名録</Link><span>/</span><span aria-current="page">{occupation.name}</span></nav>
    <Link className="back-link" href="/all/"><ArrowLeft aria-hidden="true" />職業名録へ戻る</Link>

    <header className="occupation-detail-hero">
      <div className="occupation-detail-heading">
        <span className="eyebrow">{category?.label} / 職業分類 {occupation.classificationCode}</span>
        <h1>{occupation.name}<small>とは</small></h1>
        <p>{occupation.summary}</p>
        {occupation.aliases.length > 0 && <div className="occupation-aliases"><strong>別名</strong>{occupation.aliases.map((alias) => <span key={alias}>{alias}</span>)}</div>}
      </div>
      <aside className="occupation-source-badge"><ShieldCheck aria-hidden="true" /><span><strong>公式データから構造化</strong><small>{occupationCatalogSource.title}</small><small>データ更新 {occupationCatalogSource.datasetUpdatedAt}</small></span></aside>
    </header>

    <div className="occupation-quality-note"><BadgeCheck aria-hidden="true" /><p><strong>このページの位置付け</strong> JILPTの公式解説データを項目別に再構成した職業名録の詳細です。写真・動画は転載していません。個別に人が執筆・確認した独自解説は、該当職業のみ別リンクで表示します。</p></div>

    <div className="occupation-detail-layout">
      <article className="occupation-source-article">
        <section id="work"><span className="occupation-section-label">01 / WORK</span><h2>どんな仕事か</h2><Paragraphs text={occupation.work}/></section>
        <section id="entry"><span className="occupation-section-label">02 / ENTRY</span><h2>就くには</h2><Paragraphs text={occupation.entry}/></section>
        <section id="conditions"><span className="occupation-section-label">03 / CONDITIONS</span><h2>働く条件・環境の特徴</h2><p className="occupation-caution">勤務先、雇用形態、地域、企業規模によって異なります。個別求人の待遇や採用可能性を示すものではありません。</p><Paragraphs text={occupation.conditions}/></section>

        <section id="qualifications"><span className="occupation-section-label">04 / QUALIFICATIONS</span><h2>関連資格</h2>{occupation.qualifications.length > 0 ? <ul className="occupation-qualification-list">{occupation.qualifications.map((qualification) => <li key={qualification}><BadgeCheck aria-hidden="true" />{qualification}</li>)}</ul> : <p>公式解説データに関連資格の記載はありません。資格が不要であることを断定する表示ではありません。</p>}<p className="occupation-caution">資格の必須・任意、受験要件、制度変更は、応募先と資格実施団体の公式情報を確認してください。</p></section>

        {occupation.organizations.length > 0 && <section id="organizations"><span className="occupation-section-label">05 / ORGANIZATIONS</span><h2>関連団体</h2><div className="occupation-organizations">{occupation.organizations.map((organization) => organization.url ? <a key={`${organization.name}-${organization.url}`} href={organization.url} target="_blank" rel="noopener noreferrer"><Building2 aria-hidden="true" /><span>{organization.name}</span><ArrowUpRight aria-hidden="true" /></a> : <div key={organization.name}><Building2 aria-hidden="true" /><span>{organization.name}</span></div>)}</div></section>}

        <section className="occupation-citation" id="source"><span className="occupation-section-label">SOURCE</span><h2>出典と確認範囲</h2><p>出典：独立行政法人 労働政策研究・研修機構（JILPT）作成「職業情報データベース 解説系ダウンロードデータ ver.7.01」。職業情報提供サイト（job tag）より2026年7月13日にダウンロードし、項目別に構造化しました。</p><dl><div><dt>データセット更新日</dt><dd>{occupationCatalogSource.datasetUpdatedAt}</dd></div><div><dt>この職業の解説領域更新年</dt><dd>{occupation.updatedYears.description || "データ記載なし"}</dd></div><div><dt>写真・動画</dt><dd>使用していません</dd></div><div><dt>ページ生成</dt><dd>公式データを機械的に構造化。個別の人手編集記事ではありません</dd></div></dl><div className="occupation-source-actions"><a href={sourceUrl} target="_blank" rel="noopener noreferrer">job tagの職業ページを確認 <ArrowUpRight aria-hidden="true" /></a><a href={occupationCatalogSource.downloadPage} target="_blank" rel="noopener noreferrer">データと利用条件を確認 <ArrowUpRight aria-hidden="true" /></a></div><p>誤りや更新の必要性にお気づきの場合は<Link href="/contact/">訂正窓口</Link>へお知らせください。</p></section>
      </article>

      <aside className="occupation-detail-side">
        <nav aria-label="この職業ページの目次"><strong>このページで確認</strong><a href="#work">仕事内容</a><a href="#entry">就くには</a><a href="#conditions">働く条件</a><a href="#qualifications">関連資格</a>{occupation.organizations.length > 0 && <a href="#organizations">関連団体</a>}<a href="#source">出典</a></nav>
        {reviewedSlug && <Link className="occupation-reviewed-link" href={`/career/${reviewedSlug}/`}><BadgeCheck aria-hidden="true" /><span><strong>人が確認した独自解説</strong><small>学ぶ順番・AI・動画・資格まで見る</small></span><ArrowRight aria-hidden="true" /></Link>}
        <div className="occupation-next-actions"><strong>次の入口</strong><a href="https://manapick.app/?utm_source=career&utm_medium=referral&utm_campaign=occupation_detail" target="_blank" rel="noopener noreferrer"><GraduationCap aria-hidden="true" /><span>動画で学ぶ<small>manapick</small></span><ArrowUpRight aria-hidden="true" /></a><a href={aiSearch} target="_blank" rel="noopener noreferrer"><Bot aria-hidden="true" /><span>仕事に使うAI<small>manapick AIで検索</small></span><ArrowUpRight aria-hidden="true" /></a><a href="https://license.manapick.app/search/?utm_source=career&utm_medium=referral&utm_campaign=occupation_detail" target="_blank" rel="noopener noreferrer"><LibraryBig aria-hidden="true" /><span>資格要件を確認<small>manapick license</small></span><ArrowUpRight aria-hidden="true" /></a><Link href="/shop/"><BriefcaseBusiness aria-hidden="true" /><span>学習・仕事の道具<small>manapi商店</small></span><ArrowRight aria-hidden="true" /></Link></div>
        <p className="occupation-updated"><CalendarCheck2 aria-hidden="true" />データ確認 {occupationCatalogSource.importedAt}</p>
      </aside>
    </div>

    <nav className="occupation-adjacent" aria-label="前後の職業">{previous ? <Link href={`/occupation/${previous.catalogId}/`}><ArrowLeft aria-hidden="true" /><span><small>前の職業</small>{previous.name}</span></Link> : <span/>}{next ? <Link href={`/occupation/${next.catalogId}/`}><span><small>次の職業</small>{next.name}</span><ArrowRight aria-hidden="true" /></Link> : <span/>}</nav>
  </div></>;
}
