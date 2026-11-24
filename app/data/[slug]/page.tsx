import { PhraseText } from "@/components/PhraseTitle";
import { PhraseChildren } from "@/components/PhraseChildren";
import "../../article.css";
import "../data-room.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, Clock3, ListTree } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { DataKpiBand } from "@/components/DataKpiBand";
import { DataFigure } from "@/components/DataFigure";
import sourceRegistry from "@/content/source-registry.json";
import { dataArticleBySlug, renderableDataArticles, type DataBlock } from "@/lib/data-room";
import { buildDataStaticParams, EMPTY_DATA_ROUTE_SLUG } from "@/lib/data-room-static-params.mjs";
import { absoluteUrl, metaDescription } from "@/lib/site";
import { externalRel } from "@/lib/network-links";

export const dynamicParams = false;
export function generateStaticParams() { return buildDataStaticParams(renderableDataArticles); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = dataArticleBySlug(slug);
  if (!article) return {};
  const firstParagraph = article.sections.flatMap((section) => section.blocks).find((block) => block.type === "paragraph");
  const description = metaDescription(`${article.lead}${firstParagraph && firstParagraph.type === "paragraph" ? firstParagraph.text : ""}`);
  const url = absoluteUrl(`/data/${slug}/`);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/data/${slug}/` },
    // 見本（status: "sample"）は検索に出さない。公開記事はサイト既定（index, follow）
    ...(article.status === "sample" ? { robots: { index: false, follow: false } } : {}),
    openGraph: { title: article.title, description, type: "article", url, publishedTime: article.publishedAt, modifiedTime: article.checkedAt, images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 675 }] },
    twitter: { card: "summary_large_image", title: article.title, description, images: [absoluteUrl("/og.png")] },
  };
}

const NUMERIC_CELL = /^[-+−±]?[\d.,]+[%％]?$|^[—–-]$/;

function Block({ block }: { block: DataBlock }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "figure") return <DataFigure figure={block} />;
  if (block.type === "note") return <div className="callout"><b>{block.label ?? "注意"}</b><div>{block.text}</div></div>;
  return <div className="t-scroll"><table className="t"><thead><tr>{block.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.cells.map((cell, index) => <td key={index} className={NUMERIC_CELL.test(cell.trim()) ? "n" : undefined}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export default async function DataArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === EMPTY_DATA_ROUTE_SLUG) notFound();
  const article = dataArticleBySlug(slug);
  if (!article) notFound();
  const sources = sourceRegistry.filter((source) => article.sourceIds.includes(source.sourceId));
  const url = absoluteUrl(`/data/${slug}/`);
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: article.title, description: article.lead, mainEntityOfPage: url, url, image: { "@type": "ImageObject", url: absoluteUrl("/og.png"), width: 1200, height: 675 }, datePublished: article.publishedAt, dateModified: article.checkedAt, inLanguage: "ja-JP", author: { "@type": "Organization", name: article.author, url: absoluteUrl("/operator/") }, editor: { "@type": "Organization", name: article.editor, url: absoluteUrl("/operator/") }, publisher: { "@id": absoluteUrl("/#organization") }, citation: sources.map((source) => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "トップ", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "データ室", item: absoluteUrl("/research/") }, { "@type": "ListItem", position: 3, name: article.title, item: url }] },
  ] };
  const toc = <ol>{article.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span><em className="phrase-breaks"><PhraseText text={section.heading} /></em></a></li>)}</ol>;
  return <><JsonLd data={graph}/><div className="page-shell editorial-detail data-room-detail">
    <nav className="crumb" aria-label="パンくずリスト"><Link href="/">トップ</Link><span aria-hidden="true">／</span><Link href="/research/">データ室</Link><span aria-hidden="true">／</span><span aria-current="page">{article.category}</span></nav>
    <header className="phead"><p className="phead-eyebrow"><span className="stn lg" aria-hidden="true">CA</span> CA-DATA · {article.category}</p><h1 className="phrase-breaks"><PhraseText text={article.title} /></h1><p className="phead-lead phrase-breaks"><PhraseChildren>{article.lead}</PhraseChildren></p><div className="phead-meta"><span><Clock3 aria-hidden="true" />読了目安 {article.readMinutes}分</span><span><CalendarDays aria-hidden="true" />公開 {article.publishedAt}</span><span>確認 {article.checkedAt}</span></div></header>
    <details className="mobile-article-toc"><summary><ListTree aria-hidden="true" />目次を開く</summary>{toc}</details>
    <div className="article-layout">
      <aside className="article-toc" aria-label="この記事の目次"><p><ListTree aria-hidden="true" />目次</p>{toc}<small><Clock3 aria-hidden="true" />読了目安 {article.readMinutes}分</small></aside>
      <article className="editorial-article">
        {article.kpi && <DataKpiBand items={article.kpi.items} source={article.kpi.source} />}
        {article.sections.map((section, index) => <section key={section.id} id={section.id} className="article-section"><span className="article-section-number">SECTION {String(index + 1).padStart(2, "0")}</span><h2 className="phrase-breaks"><PhraseText text={section.heading} /></h2>{section.blocks.map((block, blockIndex) => <Block key={blockIndex} block={block} />)}</section>)}
        <section className="article-review"><h2 className="phrase-breaks"><PhraseText text="執筆・確認情報" /></h2><dl><div><dt>執筆</dt><dd>{article.author}</dd></div><div><dt>編集</dt><dd>{article.editor}</dd></div><div><dt>出典台帳の記録日</dt><dd>{article.checkedAt}</dd></div><div><dt>確認方法</dt><dd>公的資料と一次情報を出典付きで整理。自動監視による資料の変化検知と、本文の正確性の確認は区別します</dd></div></dl><h3 className="phrase-breaks"><PhraseText text="参照した公式情報" /></h3><ul className="source-list">{sources.map((source) => <li key={source.sourceId}><a href={source.url} target="_blank" rel={externalRel(source.url)}>{source.provider}<ArrowUpRight aria-hidden="true" /></a><small>確認日 {source.checkedAt}／{source.notes}</small></li>)}</ul><p className="correction-note">誤りにお気づきの場合は<Link href="/contact/">訂正窓口</Link>へお知らせください。過去の資料に基づく記事は、その時点の記録として案内します。</p></section>
        <p className="article-checked"><CalendarDays aria-hidden="true" />この記事の内容確認日：{article.checkedAt}</p>
      </article>
    </div>
  </div></>;
}
