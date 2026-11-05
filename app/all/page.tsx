import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/JobCard";
import { OccupationCatalog } from "@/components/OccupationCatalog";
import { humanReviewedSlugByOccupation, occupationCatalog, occupationDirectory, occupationCatalogCategories, occupationBriefVersion, publishedOccupationCatalog } from "@/content/catalog";
import { publishedJobs } from "@/content/jobs";
import { absoluteUrl } from "@/lib/site";

import employersData from "@/content/occupation-employers.json";
import { incomeStatistics, incomeMetadata } from '@/lib/occupation-income';
import { ProfessionalEntries } from '@/components/ProfessionalEntries';
import profiles from '@/content/professional-careers.json';
const title = `${occupationCatalog.length}職業の名録｜仕事内容・関連資格・年収の目安と出典`;
const description = `${occupationCatalog.length}職業の仕事内容・入職条件・労働条件・関連資格と年収の目安を、出典つきで検索・閲覧できる名録です。そのうち${publishedOccupationCatalog.length}職業には個別ページ、${publishedJobs.length + profiles.items.length}職業には独自解説があります。`;
const image = absoluteUrl("/og.png");
export const metadata: Metadata = { title, description, alternates: { canonical: "/all/", types: { "application/rss+xml": "/feed.xml" } }, openGraph: { title, description, url: absoluteUrl("/all/"), type: "website", siteName: "manapick career", locale: "ja_JP", images: [{ url: image, width: 1200, height: 675, alt: "manapick career 職業名録" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };

export default function AllPage() {
  const url = absoluteUrl("/all/");
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: title, description, url, inLanguage: "ja-JP", mainEntity: { "@type": "ItemList", numberOfItems: publishedJobs.length + profiles.items.length, itemListElement: [...publishedJobs,...profiles.items].map((job, index) => ({ "@type": "ListItem", position: index + 1, name: job.name, url: absoluteUrl(`/career/${job.slug}/`) })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "職業一覧", item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell wide occupation-directory">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">職業一覧</span></nav>
    <header className="page-heading"><span className="eyebrow">{occupationCatalog.length}職業名録 / 個別ページ{publishedOccupationCatalog.length}件</span><h1>職業を、名前と中身から探す</h1><p>{occupationCatalog.length}職業の説明をこのページで読めます。そのうち{publishedOccupationCatalog.length}職業には個別ページがあり、仕事内容・年収の目安・なり方を出典と確認日つきで読めます。</p></header>
    <OccupationCatalog incomeStatistics={incomeStatistics} occupations={occupationDirectory} categories={occupationCatalogCategories} detailedLinks={{...humanReviewedSlugByOccupation,...Object.fromEntries(profiles.items.map(item=>[item.name,item.slug]))}} briefVersion={occupationBriefVersion} employersById={Object.fromEntries(employersData.items.map(item => [item.catalogId, item.employers.map(employer => employer.name)]))} publishedIds={publishedOccupationCatalog.map(item => item.catalogId)} />
    <section aria-label="個別ページ公開中の職業" className="published-occupation-index"><h2>個別ページ公開中の職業（{publishedOccupationCatalog.length}件）</h2><p>仕事内容・年収の目安・なり方・企業例を、出典と確認日つきの専用ページで読める職業です。分野ごとに開いて選べます。</p>{occupationCatalogCategories.map(category => { const items = publishedOccupationCatalog.filter(item => item.categoryKey === category.key); return items.length ? <details key={category.key} className="published-occupation-group"><summary>{category.label}（{items.length}件）</summary><ul>{items.map(item => <li key={item.catalogId}><Link href={`/occupation/${item.catalogId}/`}>{item.name}</Link></li>)}</ul></details> : null; })}</section>
    <ProfessionalEntries/>
    <section id="income-method" className="income-method-panel"><h2>556職業の年収：何を比較している？</h2><p>544職業は公式対応表から2025年の賃金統計へ対応付けています。12職業は対応分類がなく「対応する年収統計なし」と表示します。職業ごとの個別集計とは限らず、同じ分類に属する仕事には同じ値が表示されます。</p><p>平均年収換算＝6月の「きまって支給する現金給与額」×12＋「年間賞与その他特別給与額」。一覧の金額は小数第1位の万円へ四捨五入しています。</p>{incomeMetadata.limitations.map(text=><p key={text}>{text}</p>)}<p>{incomeMetadata.annualMedian.reason}</p><ul>{incomeMetadata.sources.map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></section>
    <section className="reviewed-jobs" aria-labelledby="reviewed-title"><div className="section-heading"><span className="eyebrow">source-linked</span><h2 id="reviewed-title">公開中の職業解説</h2><p>年収順・将来性順では並べません。仕事内容、必要スキル、入口、注意点を比較できます。</p></div><div className="job-grid">{publishedJobs.map((job) => <JobCard key={job.slug} job={job} />)}</div></section>
  </div></>;
}
