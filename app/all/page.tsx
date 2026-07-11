import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { categories, publishedJobs } from "@/content/jobs";
export const metadata:Metadata={title:"職業一覧",description:"公開品質条件を満たした職業だけをカテゴリ別に掲載しています。",alternates:{canonical:"/all/"}};
export default function AllPage(){return <div className="page-shell"><div className="page-heading"><span className="eyebrow">公開済み {publishedJobs.length}職種</span><h1>職業一覧</h1><p>年収順・将来性順では並べません。仕事内容、必要スキル、入口、注意点を比べてください。</p></div>{categories.map(category=>{const list=publishedJobs.filter(x=>x.category===category.key);return <section className="all-section" key={category.key}><div className="section-heading row"><div><h2>{category.label}</h2><p>{category.description}</p></div><Link href={`/category/${category.key}/`}>カテゴリを見る</Link></div><div className="job-grid">{list.map(job=><JobCard key={job.slug} job={job}/>)}</div></section>})}</div>}
