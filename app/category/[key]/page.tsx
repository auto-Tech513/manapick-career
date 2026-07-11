import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { categories, publishedJobs } from "@/content/jobs";

export const dynamicParams=false;
export function generateStaticParams(){return categories.map(x=>({key:x.key}))}
export async function generateMetadata({params}:{params:Promise<{key:string}>}):Promise<Metadata>{const {key}=await params;const category=categories.find(x=>x.key===key);return category?{title:`${category.label}の職業`,description:category.description,alternates:{canonical:`/category/${key}/`}}:{}}
export default async function CategoryPage({params}:{params:Promise<{key:string}>}){const {key}=await params;const category=categories.find(x=>x.key===key);if(!category)notFound();const jobs=publishedJobs.filter(x=>x.category===key);return <div className="page-shell"><div className="page-heading"><span className="eyebrow">カテゴリ</span><h1>{category.label}の仕事</h1><p>{category.description}。仕事内容・入口・注意点を比べます。</p></div><div className="job-grid">{jobs.map(job=><JobCard key={job.slug} job={job}/>)}</div><Link className="text-link" href="/all/">全カテゴリを見る</Link></div>}
