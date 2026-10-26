import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/JobCard";
import { OccupationCatalog } from "@/components/OccupationCatalog";
import { humanReviewedSlugByOccupation, occupationDirectory, occupationCatalogCategories } from "@/content/catalog";
import { publishedJobs } from "@/content/jobs";
import { absoluteUrl } from "@/lib/site";

const title = "job tag出典の556職業名録・出典付き職業解説";
const description = "job tag解説系データから職業名・別名・分類を検索し、公式job tagまたは出典・学び・AI・資格を示す独自解説へ進める職業名録です。";
const image = absoluteUrl("/og.png");
export const metadata: Metadata = { title, description, alternates: { canonical: "/all/" }, openGraph: { title, description, url: absoluteUrl("/all/"), type: "website", siteName: "manapick career", locale: "ja_JP", images: [{ url: image, width: 1200, height: 630, alt: "manapick career 職業名録" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };

export default function AllPage() {
  const url = absoluteUrl("/all/");
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: title, description, url, inLanguage: "ja-JP", mainEntity: { "@type": "ItemList", numberOfItems: publishedJobs.length, itemListElement: publishedJobs.map((job, index) => ({ "@type": "ListItem", position: index + 1, name: job.name, url: absoluteUrl(`/career/${job.slug}/`) })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "職業一覧", item: url }] },
  ] };
  return <><JsonLd data={graph}/><div className="page-shell wide occupation-directory">
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><span aria-current="page">職業一覧</span></nav>
    <header className="page-heading"><span className="eyebrow">556職業名録 / {publishedJobs.length}詳細解説</span><h1>職業を、名前と中身から探す</h1><p>名録は実在する職業名を探す入口です。詳細解説は、独自本文、公式出典、出典の記録日、動画・AI・資格との接続がある公開済みの職業だけを公開しています。</p></header>
    <OccupationCatalog occupations={occupationDirectory} categories={occupationCatalogCategories} detailedLinks={humanReviewedSlugByOccupation} />
    <section className="reviewed-jobs" aria-labelledby="reviewed-title"><div className="section-heading"><span className="eyebrow">source-linked</span><h2 id="reviewed-title">公開中の職業解説</h2><p>年収順・将来性順では並べません。仕事内容、必要スキル、入口、注意点を比較できます。</p></div><div className="job-grid">{publishedJobs.map((job) => <JobCard key={job.slug} job={job} />)}</div></section>
  </div></>;
}
