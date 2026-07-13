import type { Metadata } from "next";
import { JobCard } from "@/components/JobCard";
import { OccupationCatalog } from "@/components/OccupationCatalog";
import { humanReviewedSlugByOccupation, occupationCatalog, occupationCatalogCategories } from "@/content/catalog";
import { publishedJobs } from "@/content/jobs";

export const metadata: Metadata = { title: "job tag出典の556職業名録・確認済み職業解説", description: "job tag解説系データから、職業名・別名・分類・仕事内容・就くには・働く条件・関連資格を確認できる556職業名録と、人が出典・学び・AI・資格を確認した独自解説です。", alternates: { canonical: "/all/" } };

export default function AllPage() {
  return <div className="page-shell wide occupation-directory">
    <header className="page-heading"><span className="eyebrow">556職業名録 / {publishedJobs.length}詳細解説</span><h1>職業を、名前と中身から探す</h1><p>名録は実在する職業名を探す入口です。詳細解説は、独自本文、公式出典、確認日、動画・AI・資格との接続、編集者確認が揃った職業だけを公開しています。</p></header>
    <OccupationCatalog occupations={occupationCatalog} categories={occupationCatalogCategories} detailedLinks={humanReviewedSlugByOccupation} />
    <section className="reviewed-jobs" aria-labelledby="reviewed-title"><div className="section-heading"><span className="eyebrow">human reviewed</span><h2 id="reviewed-title">人が確認した職業解説</h2><p>年収順・将来性順では並べません。仕事内容、必要スキル、入口、注意点を比較できます。</p></div><div className="job-grid">{publishedJobs.map((job) => <JobCard key={job.slug} job={job} />)}</div></section>
  </div>;
}
