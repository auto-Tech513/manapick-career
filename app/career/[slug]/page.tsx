import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PageEvent, TrackedExternalLink } from "@/components/Tracking";
import { categories, publishedJobs } from "@/content/jobs";
import sourceRegistry from "@/content/source-registry.json";
import { networkUrl } from "@/lib/network";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams=false;
export function generateStaticParams(){return publishedJobs.map(job=>({slug:job.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const job=publishedJobs.find(x=>x.slug===slug);if(!job)return{};const title=`${job.name}になるには？仕事内容・必要スキル・学ぶ順番`;const description=`${job.conclusion.join(" ")} 資格・AI・無料学習動画まで公式情報から整理。`;return{title,description,alternates:{canonical:`/career/${job.slug}/`},openGraph:{title,description,url:absoluteUrl(`/career/${job.slug}/`),type:"article"},twitter:{card:"summary",title,description}}}

export default async function CareerPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const job=publishedJobs.find(x=>x.slug===slug);if(!job)notFound();const category=categories.find(x=>x.key===job.category);const sources=sourceRegistry.filter(source=>job.sourceIds.includes(source.sourceId));const url=absoluteUrl(`/career/${job.slug}/`);const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Article","@id":`${url}#article`,headline:`${job.name}になるには`,description:job.conclusion.join(" "),url,dateModified:job.checkedAt,author:{"@type":"Organization",name:job.author},editor:{"@type":"Organization",name:job.editor},publisher:{"@id":absoluteUrl("/#organization")},mainEntityOfPage:url,citation:sources.map(x=>x.url)},
  {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ホーム",item:absoluteUrl("/")},{"@type":"ListItem",position:2,name:category?.label,item:absoluteUrl(`/category/${job.category}/`)},{"@type":"ListItem",position:3,name:job.name,item:url}]},
  {"@type":"Occupation",name:job.name,description:job.conclusion.join(" "),mainEntityOfPage:url,skills:job.skills.join("、"),responsibilities:job.tasks.join("、")}
]};return <><JsonLd data={graph}/><PageEvent name="career_open" params={{career_slug:job.slug}}/><div className="detail-shell">
  <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><Link href={`/category/${job.category}/`}>{category?.label}</Link><span>/</span><span>{job.name}</span></nav>
  <Link className="back-link" href="/all/"><ArrowLeft aria-hidden="true"/> 職業一覧へ</Link>
  <header className="job-hero"><div className="job-hero-main"><span className="category-label"><i className={`category-dot cat-${job.category}`}/>{category?.label}</span><h1>{job.name}<small>になるには</small></h1><div className="conclusion"><strong>先に結論</strong><p>{job.conclusion[0]}</p><p>{job.conclusion[1]}</p></div></div><aside className="quick-view"><span>入口の見取り図</span><dl><div><dt>学び方</dt><dd>{job.learningLoad}</dd></div><div><dt>入口スキル</dt><dd>{job.entrySkills[0]}</dd></div><div><dt>情報確認日</dt><dd>{job.checkedAt}</dd></div></dl></aside></header>
  <div className="detail-layout"><article className="detail-content">
    <section><span className="section-num">01</span><h2>どんな仕事？</h2>{job.work.map(x=><p key={x}>{x}</p>)}<ul className="task-list">{job.tasks.map(x=><li key={x}><CheckCircle2 aria-hidden="true"/>{x}</li>)}</ul></section>
    <section><span className="section-num">02</span><h2>向いている可能性がある人</h2><p className="section-lead">適性の断定ではなく、仕事を調べるときの判断材料です。</p><ul className="check-list">{job.possibilities.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section><span className="section-num">03</span><h2>先に知っておきたい注意点</h2><div className="caution-box"><CircleAlert aria-hidden="true"/><div>{job.cautions.map(x=><p key={x}>{x}</p>)}</div></div></section>
    <section><span className="section-num">04</span><h2>必要スキルと学ぶ順番</h2><div className="chips large">{job.skills.map(x=><span key={x}>{x}</span>)}</div><ol className="learning-steps">{job.learningSteps.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,"0")}</span><p>{x}</p></li>)}</ol><div className="time-note"><strong>学習期間の考え方</strong><p>{job.learningTime}</p></div></section>
    <section><span className="section-num">05</span><h2>学び・AI・資格へ進む</h2><p className="section-lead">各サイトの役割を分け、確認済みの個別ページだけへつなぎます。</p><div className="resource-groups">
      <Resource title="無料動画で学ぶ" tone="blue" items={job.videos.map(x=>({...x,href:networkUrl(x.networkId),description:"必要な基礎を順番に学ぶ"}))}/>
      <Resource title="仕事で使うAI" tone="red" items={job.ai.map(x=>({label:x.label,href:networkUrl(x.networkId),description:x.use}))}/>
      <Resource title="関連資格を確認" tone="green" items={job.qualifications.map(x=>({...x,href:networkUrl(x.networkId),description:"試験要件を公式情報とあわせて確認"}))} empty="この仕事に必須と断定できる関連資格は設定していません。"/>
</div></section>
    <section className="editorial-block"><span className="section-num">06</span><h2>この記事の確認方法</h2><dl><div><dt>執筆</dt><dd>{job.author}</dd></div><div><dt>編集確認</dt><dd>{job.editor}</dd></div><div><dt>最終確認日</dt><dd>{job.checkedAt}</dd></div><div><dt>作成方法</dt><dd>{job.editorNote}</dd></div></dl><h3>出典</h3><ul className="source-list">{sources.map(source=><li key={source.sourceId}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.provider}<ArrowUpRight aria-hidden="true"/></a><small>確認日 {source.checkedAt}／{source.notes}</small></li>)}</ul><p>AI補助を利用した場合も、公開前に編集者が全主張とリンクを確認します。誤りにお気づきの場合は<Link href="/contact/">訂正窓口</Link>をご利用ください。</p></section>
  </article><aside className="detail-aside"><nav aria-label="このページの目次"><strong>このページで分かること</strong><a href="#main">結論</a><span>仕事内容</span><span>判断材料</span><span>注意点</span><span>学ぶ順番</span><span>出典と確認方法</span></nav><Link className="button secondary full" href="/compare/">ほかの仕事と比較する</Link></aside></div>
</div></>}

function Resource({title,tone,items,empty}:{title:string;tone:string;items:{label:string;href:string;description:string}[];empty?:string}){return <div className={`resource-card ${tone}`}><strong>{title}</strong>{items.length?items.map(item=><TrackedExternalLink key={item.href} href={item.href} eventLabel={item.label}><span>{item.label}</span><small>{item.description}</small><ArrowUpRight aria-hidden="true"/></TrackedExternalLink>):<p>{empty}</p>}</div>}
