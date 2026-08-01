import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/JobCard";
import { categories, publishedJobs } from "@/content/jobs";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams=false;
export function generateStaticParams(){return categories.map(x=>({key:x.key}))}
export async function generateMetadata({params}:{params:Promise<{key:string}>}):Promise<Metadata>{const {key}=await params;const category=categories.find(x=>x.key===key);if(!category)return{};const title=`${category.label}の職業`;const description=`${category.description}。仕事内容・入口・注意点を比べます。`;return{title,description,alternates:{canonical:`/category/${key}/`},openGraph:{title,description,url:absoluteUrl(`/category/${key}/`),type:"website",siteName:"manapick career",locale:"ja_JP"}}}
export default async function CategoryPage({params}:{params:Promise<{key:string}>}){const {key}=await params;const category=categories.find(x=>x.key===key);if(!category)notFound();const jobs=publishedJobs.filter(x=>x.category===key);const url=absoluteUrl(`/category/${key}/`);const graph={"@context":"https://schema.org","@graph":[
  {"@type":"CollectionPage",name:`${category.label}の仕事`,description:category.description,url,inLanguage:"ja-JP",mainEntity:{"@type":"ItemList",numberOfItems:jobs.length,itemListElement:jobs.map((job,index)=>({"@type":"ListItem",position:index+1,name:job.name,url:absoluteUrl(`/career/${job.slug}/`)}))}},
  {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ホーム",item:absoluteUrl("/")},{"@type":"ListItem",position:2,name:"職業一覧",item:absoluteUrl("/all/")},{"@type":"ListItem",position:3,name:category.label,item:url}]}
]};return <><JsonLd data={graph}/><div className="page-shell"><nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><Link href="/all/">職業一覧</Link><span>/</span><span aria-current="page">{category.label}</span></nav><div className="page-heading"><span className="eyebrow">カテゴリ</span><h1>{category.label}の仕事</h1><p>{category.description}。仕事内容・入口・注意点を比べます。</p></div><div className="job-grid">{jobs.map(job=><JobCard key={job.slug} job={job}/>)}</div><Link className="text-link" href="/all/">全カテゴリを見る</Link></div></>}
